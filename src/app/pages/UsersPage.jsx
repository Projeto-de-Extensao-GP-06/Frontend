import { useState } from "react";
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
  const [showNewUser, setShowNewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("az");
  if (showNewUser) return <NewUserForm onBack={() => setShowNewUser(false)} />;
  if (selectedUser) return <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} />;

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
        <button onClick={() => setShowNewUser(true)} className="users-new-button">
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
            <div key={user.id} className="user-row" onClick={() => setSelectedUser(user)}>
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

/* ── New User Form ── */
function NewUserForm({
  onBack
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Administrador");
  return <div className="users-form-page">
      <button onClick={onBack} className="back-link">
        <ArrowLeft size={14} />
        Usuários
      </button>

      <div className="users-form-header">
        <p className="page-kicker">Usuários › Novo</p>
        <h1 className="page-title page-title--sm">
          Novo Usuário
        </h1>
        <p className="users-form-subtitle">Preencha os dados para criar o acesso:</p>
      </div>

      <div className="users-form-card">
        <div className="users-field">
          <label className="users-label">Nome Completo</label>
          <input value={name} onChange={e => setName(e.target.value)} className="users-input" placeholder="Nome do usuário" />
        </div>
        <div className="users-field">
          <label className="users-label">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="users-input" placeholder="email@escritório.com" />
        </div>
        <div className="users-field">
          <label className="users-label">Cargo</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="users-input">
            <option>Administrador</option>
            <option>Advogado</option>
            <option>Assistente</option>
          </select>
        </div>
      </div>

      <div className="users-form-actions">
        <button onClick={onBack} className="users-secondary-button">
          Cancelar
        </button>
        <button onClick={onBack} className="users-primary-button">
          Criar usuário
        </button>
      </div>
    </div>;
}

/* ── User Detail ── */
function UserDetail({
  user,
  onBack
}) {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return <div className="users-detail-page">

      {/* ── Navy hero ── */}
      <div className="users-detail-hero">
        <button onClick={onBack} className="users-detail-back">
          <ArrowLeft size={13} />
          Usuários
        </button>

        <div className="users-detail-orb" />

        <div className="users-detail-head">
          <div className="users-detail-avatar">
            <span className="users-detail-initials">
              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="users-detail-copy">
            <h1 className="users-detail-name">
              {user.name}
            </h1>
            <div className="users-detail-status-row">
              <StatusBadge status={user.status} />
              <span className="users-detail-role">
                <Shield size={10} className="users-detail-role-icon" />
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="users-detail-content">

        {/* Contact info */}
        <div className="users-card">
          <h3 className="users-card-title">Informações</h3>
          <div className="users-info-list">
            <div className="users-info-row">
              <div className="users-info-icon-wrap">
                <Mail size={13} className="users-info-icon" />
              </div>
              <span className="users-info-text">{user.email}</span>
            </div>
            <div className="users-info-row">
              <div className="users-info-icon-wrap">
                <Shield size={13} className="users-info-icon" />
              </div>
              <span className="users-info-mono">
                {user.cpf}
              </span>
            </div>
          </div>
        </div>

        {/* Manage access */}
        <div className="users-card users-card--spaced">
          <h3 className="users-card-title">Gerenciar acesso</h3>

          <div className="users-field">
            <label className="users-label">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="users-input">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="users-field">
            <label className="users-label">Cargo</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="users-input">
              <option>Administrador</option>
              <option>Advogado</option>
              <option>Assistente</option>
            </select>
          </div>

          <button onClick={handleSave} className={`users-primary-button users-primary-button--save ${saved ? "is-saved" : ""}`}>
            {saved ? "✓ Salvo com sucesso" : "Salvar alterações"}
          </button>
        </div>

        {/* Delete */}
        <button onClick={() => setDeleteDialog(true)} className="users-danger-button">
          <Trash2 size={14} />
          Excluir Usuário
        </button>
      </div>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="users-dialog">
          <DialogHeader>
            <DialogTitle className="users-dialog-title">Excluir usuário?</DialogTitle>
          </DialogHeader>
          <p className="users-dialog-text">
            {user.name} será removido do sistema permanentemente.
          </p>
          <DialogFooter className="users-dialog-actions">
            <button className="users-secondary-button" onClick={() => setDeleteDialog(false)}>
              Cancelar
            </button>
            <button className="users-danger-confirm" onClick={() => {
            setDeleteDialog(false);
            onBack();
          }}>
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}