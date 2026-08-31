import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Plus, Search, Users, X } from "lucide-react";
import { ClientCard } from "../components/ClientCard";
import { FilterSelect } from "../components/FilterSelect";
import { PaginationBar } from "../components/PaginationBar";
import { mockClients } from "../data/mockData";
import "../../styles/clients-page.css";

const TYPE_OPTS = [
  { value: "todos", label: "Todos" },
  { value: "PF", label: "Pessoa Física" },
  { value: "PJ", label: "Pessoa Jurídica" },
];

const STATUS_OPTS = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

export default function ClientsPage() {
  useEffect(() => {
    document.title = "Clientes";
  }, []);

  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState(() => {
    const value = searchParams.get("status");
    return STATUS_OPTS.some(o => o.value === value) ? value : "todos";
  });
  const [sortBy, setSortBy] = useState("nome_asc");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filtered = mockClients.filter(c => {
    const term = search.toLowerCase();
    const doc = c.type === "PF" ? c.cpf : c.cnpj;
    const matchSearch = !search || c.name.toLowerCase().includes(term) || c.contacts?.some(ct => ct.email?.toLowerCase().includes(term)) || (doc && doc.includes(term));
    const matchType = typeFilter === "todos" || c.type === typeFilter;
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "nome_asc") {
      return a.name.localeCompare(b.name, "pt");
    }
    if (sortBy === "nome_desc") {
      return b.name.localeCompare(a.name, "pt");
    }
    return 0;
  });

  const hasActiveFilters = search !== "" || typeFilter !== "todos" || statusFilter !== "todos";
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("todos");
    setStatusFilter("todos");
    setPage(1);
  };

  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return <div className="clients-page">
      {/* ── Header ── */}
      <div className="clients-header">
        <div>
          <p className="clients-kicker">
            SGPJ
          </p>
          <h1 className="clients-title">
            Clientes
          </h1>
        </div>
        <button onClick={() => navigate("/app/clientes/novo")} className="clients-new-button">
          <Plus size={16} />
          Novo Cliente
        </button>
      </div>

      {/* ── Search + Filters panel ── */}
      <div className="clients-panel">
        {/* Search row */}
        <div className="clients-search-row">
          <div className="clients-search-wrap">
            <Search size={16} className="clients-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="clients-search-input"
            />
          </div>
          <button className="clients-search-button">
            Buscar
          </button>
        </div>

        {/* Divider */}
        <div className="clients-divider" />

        {/* Filters row */}
        <div className="clients-filter-row">
          <div className="clients-filter-group-left">
            <span className="clients-filter-label">
              Filtros
            </span>

            <FilterSelect
              prefix="clients"
              label="Tipo"
              value={typeFilter}
              onChange={val => {
                setTypeFilter(val);
                setPage(1);
              }}
            >
              {TYPE_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              prefix="clients"
              label="Status"
              value={statusFilter}
              onChange={val => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clients-clear-button">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="clients-sort-wrap">
            <span className="clients-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="clients-sort-select"
            >
              <option value="nome_asc">Nome (A → Z)</option>
              <option value="nome_desc">Nome (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="clients-results-row">
        <p className="clients-results-count">
          {sorted.length === mockClients.length
            ? `${sorted.length} clientes`
            : `${sorted.length} de ${mockClients.length} clientes`}
        </p>
        {sorted.length > 0 && (
          <p className="clients-results-tip">
            Clique em um cliente para ver detalhes
          </p>
        )}
      </div>

      {/* ── Client grid / empty state ── */}
      {sorted.length === 0 ? <div className="clients-empty-state">
          <div className="clients-empty-icon-wrap">
            <Users size={24} className="clients-empty-icon" />
          </div>
          <p className="clients-empty-title">
            Nenhum cliente encontrado
          </p>
          <p className="clients-empty-text">
            Tente ajustar os filtros de busca
          </p>
          {hasActiveFilters && <button onClick={clearFilters} className="clients-empty-clear">
              Limpar filtros
            </button>}
        </div> : <div className="clients-grid">
          {paginated.map(client => <ClientCard key={client.id} client={client} onClick={() => navigate(`/app/clientes/${client.id}`)} />)}
        </div>}
      <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
    </div>;
}