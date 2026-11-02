import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Mail, Calendar, Inbox, Search, X } from "lucide-react";
import { FilterSelect } from "../components/FilterSelect";
import { PaginationBar } from "../components/PaginationBar";
import {
  filtrarSolicitacoes,
  listarSolicitacoes,
  mapearSolicitacao,
} from "../services/solicitacaoService";
import "../../styles/requests-page.css";

const PAGE_SIZE = 6;
const API_PAGE_SIZE = 20;
const TYPE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PF", label: "Pessoa Física (PF)" },
  { value: "PJ", label: "Pessoa Jurídica (PJ)" },
];

function sortParams(sortBy, filtered) {
  if (sortBy === "antigo") {
    return filtered
      ? ["dataHoraInicio,asc"]
      : ["dataHoraInicio,asc", "id,asc"];
  }
  return filtered
    ? ["dataHoraInicio,desc"]
    : ["dataHoraInicio,desc", "id,desc"];
}

export default function RequestsPage() {
  useEffect(() => {
    document.title = "SGPJ | Solicitações";
  }, []);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("recente");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryIndex, setRetryIndex] = useState(0);
  const requestSequence = useRef(0);
  const activeController = useRef(null);
  const navigate = useNavigate();
  const activeFilters = useMemo(() => ({ search: debouncedSearch, type: filterType }), [debouncedSearch, filterType]);

  useEffect(() => {
    const normalizedSearch = search.trim();
    if (normalizedSearch !== debouncedSearch) {
      requestSequence.current += 1;
      activeController.current?.abort();
      setLoading(true);
    }
    const timer = window.setTimeout(() => {
      setDebouncedSearch(normalizedSearch);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();
    activeController.current = controller;
    const sequence = ++requestSequence.current;
    const filtered = Boolean(activeFilters.search || activeFilters.type);
    const firstItemIndex = (page - 1) * PAGE_SIZE;
    const apiPage = Math.floor(firstItemIndex / API_PAGE_SIZE);
    const itemOffset = firstItemIndex % API_PAGE_SIZE;
    const params = {
      page: apiPage,
      size: API_PAGE_SIZE,
      sort: sortParams(sortBy, filtered),
      signal: controller.signal,
    };

    setLoading(true);
    setError(null);
    const load = filtered
      ? filtrarSolicitacoes({
        ...params,
        pesquisa: activeFilters.search,
        tipo: activeFilters.type,
      })
      : listarSolicitacoes(params);

    load.then(async (response) => {
      if (sequence !== requestSequence.current) return;
      let content = Array.isArray(response?.content) ? response.content : [];
      if (itemOffset + PAGE_SIZE > content.length && apiPage + 1 < (Number(response?.totalPages) || 0)) {
        const nextParams = {
          ...params,
          page: apiPage + 1,
        };
        const nextResponse = filtered
          ? await filtrarSolicitacoes({
            ...nextParams,
            pesquisa: activeFilters.search,
            tipo: activeFilters.type,
          })
          : await listarSolicitacoes(nextParams);
        if (sequence !== requestSequence.current) return;
        content = [...content, ...(Array.isArray(nextResponse?.content) ? nextResponse.content : [])];
      }
      const visibleContent = content.slice(itemOffset, itemOffset + PAGE_SIZE);
      setResult({
        content: visibleContent.map(mapearSolicitacao),
        totalElements: Number(response?.totalElements) || 0,
        totalPages: Number(response?.totalPages) || 0,
        number: Number(response?.number) || 0,
      });
    }).catch((requestError) => {
      if (controller.signal.aborted || sequence !== requestSequence.current) return;
      setError(requestError.message || "Não foi possível carregar as solicitações.");
      setResult({ content: [], totalElements: 0, totalPages: 0 });
    }).finally(() => {
      if (sequence === requestSequence.current && !controller.signal.aborted) setLoading(false);
    });

    return () => {
      controller.abort();
      if (activeController.current === controller) activeController.current = null;
    };
  }, [activeFilters, page, sortBy, retryIndex]);

  const hasActiveFilters = Boolean(activeFilters.search || activeFilters.type);
  const totalPages = Math.ceil(result.totalElements / PAGE_SIZE);
  const safePage = totalPages ? Math.min(page, totalPages) : 1;
  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setPage(1);
  };

  return <div className="requests-page">
      <div className="requests-header">
        <p className="page-kicker">SGPJ</p>
        <h1 className="page-title">Solicitações</h1>
      </div>

      <div className="requests-panel">
        <div className="requests-search-row">
          <div className="requests-search-wrap">
            <Search size={16} className="requests-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome, e-mail ou número CNJ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="requests-search-input"
              aria-label="Pesquisar solicitações"
            />
          </div>
          <button className="requests-search-button" type="button" onClick={() => { setDebouncedSearch(search.trim()); setPage(1); }}>
            Buscar
          </button>
        </div>

        <div className="requests-divider" />
        <div className="requests-filter-row">
          <div className="requests-filter-group-left">
            <span className="requests-filter-label">Filtros</span>
            <FilterSelect
              prefix="requests"
              className={`requests-filter-select${filterType ? " requests-filter-select--active" : ""}`}
              label="Tipo"
              value={filterType}
              onChange={(value) => { setFilterType(value); setPage(1); }}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value || "todos"} value={option.value}>{option.label}</option>
              ))}
            </FilterSelect>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="requests-clear-button" type="button">
                <X size={11} /> Limpar filtros
              </button>
            )}
          </div>

          <div className="requests-sort-wrap">
            <span className="requests-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(event) => { setSortBy(event.target.value); setPage(1); }}
              className="requests-sort-select"
              aria-label="Ordenar solicitações"
            >
              <option value="recente">Data (Mais recente)</option>
              <option value="antigo">Data (Mais antiga)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="requests-results-row">
        <p className="requests-results-count">
          {loading ? "Carregando solicitações..." : `${result.totalElements} solicitações`}
        </p>
        {!loading && result.totalElements > 0 && (
          <p className="requests-results-tip">Clique em uma solicitação para ver detalhes</p>
        )}
      </div>

      {loading ? (
        <div className="requests-empty-state" role="status">
          <p className="requests-empty-title">Carregando solicitações...</p>
        </div>
      ) : error ? (
        <div className="requests-empty-state" role="alert">
          <p className="requests-empty-title">Não foi possível carregar as solicitações</p>
          <p className="requests-empty-text">{error}</p>
          <button onClick={() => setRetryIndex((index) => index + 1)} className="requests-empty-clear" type="button">
            Tentar novamente
          </button>
        </div>
      ) : result.content.length === 0 ? (
        <div className="requests-empty-state">
          <div className="requests-empty-icon-wrap"><Inbox size={24} className="requests-empty-icon" /></div>
          <p className="requests-empty-title">Nenhuma solicitação encontrada</p>
          <p className="requests-empty-text">Tente ajustar os filtros de busca</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="requests-empty-clear" type="button">Limpar filtros</button>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {result.content.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={() => navigate(`/app/solicitacoes/${request.id}`)}
            />
          ))}
        </div>
      )}
      {!loading && !error && <PaginationBar page={safePage} total={totalPages} onPage={setPage} />}
    </div>;
}

function RequestCard({ request, onClick }) {
  return <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(event) => event.key === "Enter" && onClick()} className="request-card">
      <div className="request-card-body">
        <div className="request-card-topline">
          <p className="request-card-name">{request.companyName || request.name}</p>
          <div className="request-card-actions">
            <span style={{
              fontSize: "0.6875rem",
              fontWeight: "700",
              padding: "0.15rem 0.45rem",
              borderRadius: "0.375rem",
              backgroundColor: request.type === "PJ" ? "#f5edd8" : "#eef1f8",
              color: request.type === "PJ" ? "#8b6234" : "#1d4ed8",
              border: "1px solid #e2e8f0",
            }}>{request.type}</span>
            <ChevronRight size={14} className="request-card-chevron" />
          </div>
        </div>
        <div className="request-card-meta">
          {request.companyName && <><span className="request-card-contact-name">Contato: {request.name}</span><span className="request-card-dot">·</span></>}
          <span className="request-card-date"><Calendar size={10} className="request-card-date-icon" />{request.createdAt}</span>
        </div>
        <p className="request-card-description">{request.description}</p>
        {request.processNumber && <div className="request-card-process">
          <div className="request-card-process-pill"><span className="request-card-process-number">{request.processNumber}</span></div>
          {request.judgingBody && <p className="request-card-body-text"><span className="request-card-body-label">Órgão:</span> {request.judgingBody}</p>}
        </div>}
      </div>
      <div className="request-card-footer"><Mail size={11} className="request-card-mail" /><span className="request-card-email">{request.email}</span></div>
    </div>;
}
