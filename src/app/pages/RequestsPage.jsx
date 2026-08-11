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
const EMPTY_MSG = {
  todas: "Nenhuma solicitação recebida",
  pendente: "Nenhuma solicitação pendente",
  aceita: "Nenhuma solicitação aceita",
  negada: "Nenhuma solicitação negada"
};
export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState("todas");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recente");
  const navigate = useNavigate();
  const counts = {
    todas: mockRequests.length,
    pendente: mockRequests.filter(r => r.status === "pendente").length,
    aceita: mockRequests.filter(r => r.status === "aceita").length,
    negada: mockRequests.filter(r => r.status === "negada").length
  };
  const byTab = activeTab === "todas" ? mockRequests : mockRequests.filter(r => r.status === activeTab);
  const bySearch = search.trim() === "" ? byTab : byTab.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()) || r.state.toLowerCase().includes(search.toLowerCase()));
  const filtered = [...bySearch].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name, "pt");
    if (sortBy === "za") return b.name.localeCompare(a.name, "pt");
    if (sortBy === "antigo") return a.createdAt.split("/").reverse().join("") > b.createdAt.split("/").reverse().join("") ? 1 : -1;
    return a.createdAt.split("/").reverse().join("") < b.createdAt.split("/").reverse().join("") ? 1 : -1;
  });
  const hasSearch = search.trim() !== "";
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
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
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`requests-tab ${isActive ? "is-active" : ""}`}>
                <span className="requests-tab-label">{tab.label}</span>
                <span className={`requests-tab-count ${isActive ? "is-active" : ""}`}>
                  {counts[tab.id]}
                </span>
                {isActive && <div className="requests-tab-indicator" />}
              </button>;
        })}
        </div>
      </div>

      {/* ── Search + sort panel ── */}
      <div className="requests-filter-panel">
        <div className="requests-search-row">
          <div className="requests-search-wrap">
            <Search size={15} className="requests-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou estado..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="requests-search-input"
            />
            {hasSearch && (
              <button onClick={() => setSearch("")} className="requests-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="requests-sort-wrap">
            <span className="requests-sort-label">Ordenar:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="requests-sort-select">
              <option value="recente">Mais recente</option>
              <option value="antigo">Mais antigo</option>
              <option value="az">Nome A→Z</option>
              <option value="za">Nome Z→A</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {filtered.length > 0 && <p className="requests-results-count">
          {filtered.length}{" "}
          {filtered.length === 1 ? "solicitação" : "solicitações"}
        </p>}

      {/* ── List / empty state ── */}
      {filtered.length === 0 ? <div className="requests-empty-state">
          <div className="requests-empty-icon-wrap">
            <Inbox size={24} className="requests-empty-icon" />
          </div>
          <p className="requests-empty-title">
            Nenhuma solicitação
          </p>
          <p className="requests-empty-text">{EMPTY_MSG[activeTab]}</p>
        </div> : <div className="requests-grid">
          {paginated.map(r => <RequestCard key={r.id} request={r} onClick={() => navigate(`/app/solicitacoes/${r.id}`)} />)}
        </div>}
      <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
    </div>;
}
function PaginationBar({ page, total, onPage }) {
  if (total <= 1) return null;
  return (
    <div className="pagination">
      <button className="pagination__btn" onClick={() => onPage(page - 1)} disabled={page === 1}>‹</button>
      {Array.from({ length: total }, (_, i) => (
        <button key={i} className={`pagination__page ${page === i + 1 ? "is-active" : ""}`} onClick={() => onPage(i + 1)}>{i + 1}</button>
      ))}
      <button className="pagination__btn" onClick={() => onPage(page + 1)} disabled={page === total}>›</button>
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