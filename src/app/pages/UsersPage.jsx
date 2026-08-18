import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Mail, Shield, Trash2, ChevronRight, ArrowLeft, UserCog, Search, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { mockUsers } from "../data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/users-page.css";

/* Unique initials-based avatar colors */
const avatarPalette = [{
  bg: "user-avatar--blue",
  text: "user-avatar-text--blue"
}, {
  bg: "user-avatar--gold",
  text: "user-avatar-text--gold"
}, {
  bg: "user-avatar--green",
  text: "user-avatar-text--green"
}, {
  bg: "user-avatar--amber",
  text: "user-avatar-text--amber"
}];
function UserAvatar({
  name,
  size = "md"
}) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const idx = name.charCodeAt(0) % avatarPalette.length;
  const {
    bg,
    text
  } = avatarPalette[idx];
  return <div className={`user-avatar ${size === "lg" ? "is-lg" : size === "sm" ? "is-sm" : "is-md"} ${bg}`}>
      <span className={`user-avatar-initials ${text}`}>{initials}</span>
    </div>;
}
export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");
  const navigate = useNavigate();

  const bySearch = search.trim() === ""
    ? mockUsers
    : mockUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      );
  const filtered = [...bySearch].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name, "pt");
    if (sortBy === "za") return b.name.localeCompare(a.name, "pt");
    if (sortBy === "ativos") return a.status === b.status ? 0 : a.status === "ativo" ? -1 : 1;
    return 0;
  });
  const hasSearch = search.trim() !== "";
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return <div className="users-page">

      {/* ── Header ── */}
      <div className="users-header">
        <div>
          <p className="page-kicker">SGPJ</p>
          <h1 className="page-title">
            Usuários
          </h1>
        </div>
        <button onClick={() => navigate("/app/usuarios/novo")} className="users-new-button">
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* ── Count summary ── */}
      <div className="users-summary-grid">
        <div className="users-summary-card users-summary-card--primary">
          <div className="users-summary-icon-wrap users-summary-icon-wrap--primary">
            <UserCog size={13} className="users-summary-icon users-summary-icon--primary" />
          </div>
          <div className="users-summary-copy">
            <p className="users-summary-value users-summary-value--primary">{mockUsers.length}</p>
            <p className="users-summary-label">Total no sistema</p>
          </div>
        </div>
        <div className="users-summary-card users-summary-card--success">
          <div className="users-summary-icon-wrap users-summary-icon-wrap--success">
            <Shield size={13} className="users-summary-icon users-summary-icon--success" />
          </div>
          <div className="users-summary-copy">
            <p className="users-summary-value users-summary-value--success">
              {mockUsers.filter(u => u.status === "ativo").length}
            </p>
            <p className="users-summary-label">Ativos</p>
          </div>
        </div>
      </div>

      {/* ── Search + sort panel ── */}
      <div className="users-filter-panel">
        <div className="users-search-row">
          <div className="users-search-wrap">
            <Search size={15} className="users-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou cargo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="users-search-input"
            />
            {hasSearch && (
              <button onClick={() => setSearch("")} className="users-search-clear">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="users-sort-wrap">
            <span className="users-sort-label">Ordenar:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="users-sort-select">
              <option value="az">Nome A→Z</option>
              <option value="za">Nome Z→A</option>
              <option value="ativos">Ativos primeiro</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      {filtered.length > 0 && (
        <p className="users-results-count">
          {filtered.length} {filtered.length === 1 ? "usuário" : "usuários"}
          {hasSearch && " encontrados"}
        </p>
      )}

      {/* ── User grid ── */}
      <div className="users-grid">
        {filtered.length === 0
          ? <div className="users-empty">
              <UserCog size={28} className="users-empty__icon" />
              <p className="users-empty__text">Nenhum usuário encontrado</p>
            </div>
          : paginated.map(user => (
            <div key={user.id} className="user-row" onClick={() => navigate(`/app/usuarios/${user.id}`)}>
              <div className="user-row-main">
                <UserAvatar name={user.name} />
                <div className="user-row-copy">
                  <p className="user-row-name">{user.name}</p>
                  <p className="user-row-email">{user.email}</p>
                </div>
                <ChevronRight size={16} className="user-row-chevron" />
              </div>
              <div className="user-row-footer">
                <StatusBadge status={user.status} />
                <span className="user-row-role">
                  <Shield size={11} className="user-row-role-icon" />
                  {user.role}
                </span>
              </div>
            </div>
          ))}
      </div>
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
