import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Mail, Calendar, Inbox, Search, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { mockRequests } from "../data/mockData";
import "../../styles/requests-page.css";
const TABS = [{
  id: "todas",
  label: "Todas"
}, {
  id: "pendente",
  label: "Pendentes"
}, {
  id: "aceita",
  label: "Aceitas"
}, {
  id: "negada",
  label: "Negadas"
}];

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("Todos");
  const [sortBy, setSortBy] = useState("recente");
  const navigate = useNavigate();

  const stateOptions = ["Todos", ...Array.from(new Set(mockRequests.map(r => r.state)))];

  const searchFiltered = mockRequests.filter(r => {
    const q = search.trim().toLowerCase();
    const cleanQ = q.replace(/[.\-/]/g, "");
    const matchQ = !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.processNumber && (
        r.processNumber.toLowerCase().includes(q) ||
        (cleanQ && r.processNumber.replace(/[.\-/]/g, "").includes(cleanQ))
      ));
    const matchState = filterState === "Todos" || r.state === filterState;
    return matchQ && matchState;
  });

  const counts = {
    todas: searchFiltered.length,
    pendente: searchFiltered.filter(r => r.status === "pendente").length,
    aceita: searchFiltered.filter(r => r.status === "aceita").length,
    negada: searchFiltered.filter(r => r.status === "negada").length
  };

  const filtered = activeTab === "todas"
    ? searchFiltered
    : searchFiltered.filter(r => r.status === activeTab);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "nome_asc" || sortBy === "az") return a.name.localeCompare(b.name, "pt");
    if (sortBy === "nome_desc" || sortBy === "za") return b.name.localeCompare(a.name, "pt");
    if (sortBy === "antigo") {
      const [dayA, monthA, yearA] = a.createdAt.split("/");
      const [dayB, monthB, yearB] = b.createdAt.split("/");
      return new Date(`${yearA}-${monthA}-${dayA}`).getTime() - new Date(`${yearB}-${monthB}-${dayB}`).getTime();
    }
    if (sortBy === "recente") {
      const [dayA, monthA, yearA] = a.createdAt.split("/");
      const [dayB, monthB, yearB] = b.createdAt.split("/");
      return new Date(`${yearB}-${monthB}-${dayB}`).getTime() - new Date(`${yearA}-${monthA}-${dayA}`).getTime();
    }
    return 0;
  });

  const hasActiveFilters = search !== "" || filterState !== "Todos" || activeTab !== "todas";
  const clearFilters = () => {
    setSearch("");
    setFilterState("Todos");
    setActiveTab("todas");
    setPage(1);
  };

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return <div className="requests-page">
      {/* ── Header ── */}
      <div className="requests-header">
        <p className="page-kicker">
          SGPJ
        </p>
        <h1 className="page-title">
          Solicitações
        </h1>
      </div>

      {/* ── Tab bar ── */}
      <div className="requests-tabs-panel">
        <div className="requests-tabs">
          {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }} className={`requests-tab ${isActive ? "is-active" : ""}`}>
                <span className="requests-tab-label">{tab.label}</span>
                <span className={`requests-tab-count ${isActive ? "is-active" : ""}`}>
                  {counts[tab.id]}
                </span>
                {isActive && <div className="requests-tab-indicator" />}
              </button>;
        })}
        </div>
      </div>

      {/* ── Search + Filters panel ── */}
      <div className="requests-panel">
        {/* Search row */}
        <div className="requests-search-row">
          <div className="requests-search-wrap">
            <Search size={16} className="requests-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome, e-mail ou número CNJ..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="requests-search-input"
            />
          </div>
          <button className="requests-search-button">
            Buscar
          </button>
        </div>

        {/* Divider */}
        <div className="requests-divider" />

        {/* Filters row */}
        <div className="requests-filter-row">
          <div className="requests-filter-group-left">
            <span className="requests-filter-label">
              Filtros
            </span>

            <FilterSelect
              label="Estado"
              value={filterState}
              onChange={val => {
                setFilterState(val);
                setPage(1);
              }}
            >
              {stateOptions.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </FilterSelect>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="requests-clear-button">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="requests-sort-wrap">
            <span className="requests-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="requests-sort-select"
            >
              <option value="recente">Data (Mais recente)</option>
              <option value="antigo">Data (Mais antiga)</option>
              <option value="nome_asc">Nome do solicitante (A → Z)</option>
              <option value="nome_desc">Nome do solicitante (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="requests-results-row">
        <p className="requests-results-count">
          {sorted.length === mockRequests.length
            ? `${sorted.length} solicitações`
            : `${sorted.length} de ${mockRequests.length} solicitações`}
        </p>
        {sorted.length > 0 && (
          <p className="requests-results-tip">
            Clique em uma solicitação para ver detalhes
          </p>
        )}
      </div>

      {/* ── List / empty state ── */}
      {sorted.length === 0 ? (
        <div className="requests-empty-state">
          <div className="requests-empty-icon-wrap">
            <Inbox size={24} className="requests-empty-icon" />
          </div>
          <p className="requests-empty-title">
            Nenhuma solicitação encontrada
          </p>
          <p className="requests-empty-text">
            Tente ajustar os filtros de busca
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="requests-empty-clear">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {paginated.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              onClick={() => navigate(`/app/solicitacoes/${r.id}`)}
            />
          ))}
        </div>
      )}
      <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
    </div>;
}

function FilterSelect({
  label,
  value,
  onChange,
  children
}) {
  return (
    <div className="requests-filter-select">
      <span className="requests-filter-select-label">
        {label}:
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="requests-filter-select-input"
      >
        {children}
      </select>
    </div>
  );
}
function PaginationBar({ page, total, onPage }) {
  if (total <= 1) return null;

  const MAX_VISIBLE_PAGES = 10;
  const currentBlock = Math.floor((page - 1) / MAX_VISIBLE_PAGES);
  const startPage = currentBlock * MAX_VISIBLE_PAGES + 1;
  const endPage = Math.min(startPage + MAX_VISIBLE_PAGES - 1, total);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__page ${page === p ? "is-active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="pagination__btn"
        onClick={() => onPage(page + 1)}
        disabled={page === total}
        aria-label="Próxima página"
      >
        ›
      </button>
    </div>
  );
}
function RequestCard({
  request,
  onClick
}) {
  return <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onClick()} className="request-card">
      {/* Card body */}
      <div className="request-card-body">
        {/* Name + status + chevron */}
        <div className="request-card-topline">
          <p className="request-card-name">
            {request.name}
          </p>
          <div className="request-card-actions">
            <StatusBadge status={request.status} />
            <ChevronRight size={14} className="request-card-chevron" />
          </div>
        </div>

        {/* State + date — secondary hierarchy */}
        <div className="request-card-meta">
          <span className="request-card-state">{request.state}</span>
          <span className="request-card-dot">·</span>
          <span className="request-card-date">
            <Calendar size={10} className="request-card-date-icon" />
            {request.createdAt}
          </span>
        </div>

        {/* Description */}
        <p className="request-card-description">
          {request.description}
        </p>

        {/* Process number (if linked) */}
        {request.processNumber && <div className="request-card-process">
            <div className="request-card-process-pill">
              <span className="request-card-process-number">
                {request.processNumber}
              </span>
            </div>
            {request.judgingBody && <p className="request-card-body-text">
                <span className="request-card-body-label">Órgão:</span>{" "}
                {request.judgingBody}
              </p>}
          </div>}
      </div>

      {/* Card footer — email */}
      <div className="request-card-footer">
        <Mail size={11} className="request-card-mail" />
        <span className="request-card-email">{request.email}</span>
      </div>
    </div>;
}