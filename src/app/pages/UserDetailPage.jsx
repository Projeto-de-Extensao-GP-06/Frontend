import { useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { ArrowLeft, Mail, Shield, Trash2 } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { mockUsers } from "../data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/user-detail-page.css";

export default function UserDetailPage() {
  const { id } = useParams();
  const user = mockUsers.find((u) => u.id === id);

  if (!user) return <Navigate to="/app/usuarios" replace />;

  return <UserDetail user={user} />;
}

function UserDetail({ user }) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div className="user-detail-page">
      {/* ── Navy Hero ── */}
      <div className="user-detail-hero">
        <button
          onClick={() => navigate("/app/usuarios")}
          className="user-detail-back"
        >
          <ArrowLeft size={13} />
          Usuários
        </button>

        <div className="user-detail-orb" />

        <div className="user-detail-head">
          <div className="user-detail-avatar">
            <span className="user-detail-initials">
              {initials}
            </span>
          </div>
          <div className="user-detail-copy">
            <h1 className="user-detail-name">
              {user.name}
            </h1>
            <div className="user-detail-status-row">
              <StatusBadge status={user.status} />
              <span className="user-detail-role">
                <Shield size={10} className="user-detail-role-icon" />
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="user-detail-content">
        {/* Informações */}
        <div className="user-detail-card">
          <h3 className="user-detail-card-title">Informações</h3>
          <div className="user-detail-info-list">
            <div className="user-detail-info-row">
              <div className="user-detail-info-icon-wrap">
                <Mail size={13} className="user-detail-info-icon" />
              </div>
              <span className="user-detail-info-text">{user.email}</span>
            </div>
            <div className="user-detail-info-row">
              <div className="user-detail-info-icon-wrap">
                <Shield size={13} className="user-detail-info-icon" />
              </div>
              <span className="user-detail-info-mono">
                {user.cpf}
              </span>
            </div>
          </div>
        </div>

        {/* Gerenciar acesso */}
        <div className="user-detail-card">
          <h3 className="user-detail-card-title">Gerenciar acesso</h3>

          <div className="user-detail-field">
            <label className="user-detail-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="user-detail-select"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="user-detail-field">
            <label className="user-detail-label">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="user-detail-select"
            >
              <option>Administrador</option>
              <option>Advogado</option>
              <option>Assistente</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className={`user-detail-btn-save ${
              saved ? "is-saved" : ""
            }`}
          >
            {saved ? "✓ Salvo com sucesso" : "Salvar alterações"}
          </button>
        </div>

        {/* Excluir */}
        <button
          onClick={() => setDeleteDialog(true)}
          className="user-detail-btn-delete"
        >
          <Trash2 size={14} />
          Excluir Usuário
        </button>
      </div>

      {/* ── Modal Excluir ── */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="user-detail-dialog">
          <DialogHeader>
            <DialogTitle className="user-detail-dialog-title">
              Excluir usuário?
            </DialogTitle>
          </DialogHeader>
          <p className="user-detail-dialog-text">
            {user.name} será removido do sistema permanentemente.
          </p>
          <DialogFooter className="user-detail-dialog-actions">
            <button
              className="user-detail-dialog-btn-cancel"
              onClick={() => setDeleteDialog(false)}
            >
              Cancelar
            </button>
            <button
              className="user-detail-dialog-btn-confirm"
              onClick={() => {
                setDeleteDialog(false);
                navigate("/app/usuarios");
              }}
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



