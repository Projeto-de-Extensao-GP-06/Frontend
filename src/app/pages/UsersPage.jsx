import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Shield, ChevronRight, UserCog, Search, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { mockUsers } from "../data/mockData";
import "../../styles/users-page.css";

const STATUS_OPTS = [
  { value: "Todos", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

/* Unique initials-based avatar colors */
const avatarPalette = [
  { bg: "user-avatar--blue", text: "user-avatar-text--blue" },
  { bg: "user-avatar--gold", text: "user-avatar-text--gold" },
  { bg: "user-avatar--green", text: "user-avatar-text--green" },
  { bg: "user-avatar--amber", text: "user-avatar-text--amber" },
];

function UserAvatar({ name, size = "md" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const idx = name.charCodeAt(0) % avatarPalette.length;
  const { bg, text } = avatarPalette[idx];
  return (
    <div className={`user-avatar ${size === "lg" ? "is-lg" : size === "sm" ? "is-sm" : "is-md"} ${bg}`}>
      <span className={`user-avatar-initials ${text}`}>{initials}</span>
    </div>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <div className="users-filter-select">
      <span className="users-filter-select-label">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="users-filter-select-input"
      >
        {children}
      </select>
    </div>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [sortBy, setSortBy] = useState("az");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const roleOptions = ["Todos", ...Array.from(new Set(mockUsers.map((u) => u.role)))];

  const filtered = mockUsers.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchQ =
      !search ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    const matchRole = filterRole === "Todos" || u.role === filterRole;
    const matchStatus = filterStatus === "Todos" || u.status === filterStatus;
    return matchQ && matchRole && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "az") return a.name.localeCompare(b.name, "pt");
    if (sortBy === "za") return b.name.localeCompare(a.name, "pt");
    return 0;
  });

  const hasActiveFilters =
    search.trim() !== "" || filterRole !== "Todos" || filterStatus !== "Todos";

  const clearFilters = () => {
    setSearch("");
    setFilterRole("Todos");
    setFilterStatus("Todos");
    setPage(1);
  };

  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="users-page">
      {/* ── Header ── */}
      <div className="users-header">
        <div>
          <p className="page-kicker">SGPJ</p>
          <h1 className="page-title">Usuários</h1>
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
              {mockUsers.filter((u) => u.status === "ativo").length}
            </p>
            <p className="users-summary-label">Ativos</p>
          </div>
        </div>
      </div>

      {/* ── Search + Filters panel ── */}
      <div className="users-panel">
        {/* Search row */}
        <div className="users-search-row">
          <div className="users-search-wrap">
            <Search size={16} className="users-search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por nome ou e-mail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="users-search-input"
            />
          </div>
          <button className="users-search-button">Buscar</button>
        </div>

        {/* Divider */}
        <div className="users-divider" />

        {/* Filters row */}
        <div className="users-filter-row">
          <div className="users-filter-group-left">
            <span className="users-filter-label">Filtros</span>

            <FilterSelect
              label="Cargo"
              value={filterRole}
              onChange={(val) => {
                setFilterRole(val);
                setPage(1);
              }}
            >
              {roleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Status"
              value={filterStatus}
              onChange={(val) => {
                setFilterStatus(val);
                setPage(1);
              }}
            >
              {STATUS_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </FilterSelect>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="users-clear-button">
                <X size={11} />
                Limpar filtros
              </button>
            )}
          </div>

          <div className="users-sort-wrap">
            <span className="users-sort-label">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="users-sort-select"
            >
              <option value="az">Nome (A → Z)</option>
              <option value="za">Nome (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="users-results-row">
        <p className="users-results-count">
          {filtered.length === mockUsers.length
            ? `${filtered.length} usuários`
            : `${filtered.length} de ${mockUsers.length} usuários`}
        </p>
        {filtered.length > 0 && (
          <p className="users-results-tip">
            Clique em um usuário para ver detalhes
          </p>
        )}
      </div>

      {/* ── User grid ── */}
      <div className="users-grid">
        {filtered.length === 0 ? (
          <div className="users-empty">
            <UserCog size={28} className="users-empty__icon" />
            <p className="users-empty__text">Nenhum usuário encontrado</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="users-clear-button" style={{ marginTop: "0.5rem" }}>
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          paginated.map((user) => (
            <div
              key={user.id}
              className="user-row"
              onClick={() => navigate(`/app/usuarios/${user.id}`)}
            >
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
          ))
        )}
      </div>
      <PaginationBar page={safePage} total={totalPages} onPage={setPage} />
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

