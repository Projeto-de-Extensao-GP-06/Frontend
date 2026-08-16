import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Building2, User, ChevronRight, Users, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { mockClients } from "../data/mockData";
import "../../styles/clients-page.css";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const navigate = useNavigate();
  const filtered = mockClients.filter(c => {
    const term = search.toLowerCase();
    const doc = c.type === "PF" ? c.cpf : c.cnpj;
    const matchSearch = !search || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || doc.includes(term);
    const matchType = typeFilter === "todos" || c.type === typeFilter;
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });
  const hasActiveFilters = search !== "" || typeFilter !== "todos" || statusFilter !== "todos";
  const clearFilters = () => {
    setSearch("");
    setTypeFilter("todos");
    setStatusFilter("todos");
    setPage(1);
  };
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
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
            <input type="text" placeholder="Buscar por nome, e-mail ou CPF/CNPJ..." value={search} onChange={e => setSearch(e.target.value)} className="clients-search-input" />
          </div>
          <button className="clients-search-button">
            Buscar
          </button>
        </div>

        {/* Divider */}
        <div className="clients-divider" />

        {/* Filter controls */}
        <div className="clients-filters-grid">
          {/* Type filter */}
          <div>
            <p className="clients-filter-label">
              Tipo de pessoa
            </p>
            <div className="clients-filter-group">
              {["todos", "PF", "PJ"].map(t => <button key={t} onClick={() => setTypeFilter(t)} className={`clients-filter-pill ${typeFilter === t ? "is-active" : ""}`}>
                  {t === "todos" ? "Todos" : t === "PF" ? "Física" : "Jurídica"}
                </button>)}
            </div>
          </div>

          {/* Status filter */}
          <div>
            <p className="clients-filter-label">
              Status
            </p>
            <div className="clients-filter-group">
              {["todos", "ativo", "inativo"].map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`clients-filter-pill ${statusFilter === s ? "is-active" : ""}`}>
                  {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results count + clear ── */}
      <div className="clients-results-row">
        <p className="clients-results-count">
          {filtered.length === mockClients.length ? `${filtered.length} clientes` : `${filtered.length} de ${mockClients.length} clientes`}
        </p>
        {hasActiveFilters && <button onClick={clearFilters} className="clients-clear-filters">
            <X size={11} />
            Limpar filtros
          </button>}
      </div>

      {/* ── Client grid / empty state ── */}
      {filtered.length === 0 ? <div className="clients-empty-state">
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
function ClientCard({
  client,
  onClick
}) {
  const isPF = client.type === "PF";
  const doc = isPF ? client.cpf : client.cnpj;
  return <div onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && onClick()} className="client-card">
      {/* Card body */}
      <div className="client-card-body">
        {/* Avatar */}
        <div className={`client-card-avatar ${isPF ? "is-pf" : "is-pj"}`}>
          {isPF ? <User size={18} className="client-card-avatar-icon is-pf" /> : <Building2 size={18} className="client-card-avatar-icon is-pj" />}
        </div>

        {/* Info */}
        <div className="client-card-info">
          <div className="client-card-title-row">
            <p className="client-card-name">
              {client.name}
            </p>
            <span className={`client-card-type ${isPF ? "is-pf" : "is-pj"}`}>
              {client.type}
            </span>
          </div>
          <p className="client-card-doc">
            {doc}
          </p>
        </div>

        <ChevronRight size={15} className="client-card-chevron" />
      </div>

      {/* Footer row */}
      <div className="client-card-footer">
        <p className="client-card-email">{client.email}</p>
        <StatusBadge status={client.status} />
      </div>
    </div>;
}