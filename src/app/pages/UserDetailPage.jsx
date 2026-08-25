import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { ArrowLeft, Mail, Shield, AlertTriangle, Save, CheckCircle, RefreshCw } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { getInitials } from "../components/UserAvatar";
import { mockUsers } from "../data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/user-detail-page.css";

export default function UserDetailPage() {
  useEffect(() => {
    document.title = `Usuário - ${user.name}`;
  }, []);

  const { id } = useParams();
  const user = mockUsers.find((u) => u.id === id);

  if (!user) return <Navigate to="/app/usuarios" replace />;

  return <UserDetail user={user} />;
}

function UserDetail({ user }) {
  const navigate = useNavigate();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [email, setEmail] = useState(user.email || "");
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);
  const [saved, setSaved] = useState(false);

  const isInactive = status === "inativo";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = getInitials(user.name);

  return (
    <div className="user-detail-page">
      {/* ── Navy Hero ── */}
      <div className="user-detail-hero">
        <button
          onClick={() => navigate("/app/usuarios")}
          className="user-detail-back"
        >
          <ArrowLeft size={15} />
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
              <StatusBadge status={status} />
              <span className="user-detail-role">
                <Shield size={10} className="user-detail-role-icon" />
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="user-detail-content">
        {/* Informações e Gerenciamento */}
        <div className="user-detail-card">
          <h3 className="user-detail-card-title">
            <Mail size={14} className="user-card__title-icon" />
            Informações e Acesso
          </h3>
          <div className="user-detail-field">
            <label className="user-detail-label">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="user-detail-input"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="user-detail-field">
            <label className="user-detail-label">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="user-detail-select"
              disabled={isInactive}
            >
              <option>Administrador</option>
              <option>Advogado</option>
              <option>Assistente</option>
            </select>
          </div>

          <button
            onClick={() => setSaveDialogOpen(true)}
            className={`user-detail-btn-save ${
              saved ? "is-saved" : ""
            }`}
          >
            {saved ? (
              "✓ Salvo com sucesso"
            ) : (
              <>
                <Save size={15} />
                Salvar alterações
              </>
            )}
          </button>
        </div>

        {/* Desativar ou Reativar */}
        {!isInactive ? (
          <button
            onClick={() => setDeactivateDialogOpen(true)}
            className="user-detail-btn-deactivate"
          >
            <AlertTriangle size={15} className="user-detail-dialog__icon" />
            Desativar Usuário
          </button>
        ) : (
          <button
            onClick={() => setReactivateDialogOpen(true)}
            className="user-detail-btn-reactivate"
          >
            <RefreshCw size={15} />
            Reativar Usuário
          </button>
        )}
      </div>

      {/* ── Modal Salvar Alterações ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="user-detail-dialog">
          <DialogHeader>
            <div className="user-detail-dialog__header">
              <div className="user-detail-dialog__icon-wrap user-detail-dialog__icon-wrap--blue">
                <CheckCircle size={24} className="user-detail-dialog__icon" />
              </div>
              <DialogTitle className="user-detail-dialog-title">
                Confirmar alterações do usuário
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="user-detail-dialog-text">
            Deseja salvar as alterações no cadastro de <strong className="user-detail-dialog__highlight">{user.name}</strong>?
          </p>
          <DialogFooter className="user-detail-dialog-actions">
            <button
              className="user-detail-dialog-btn-cancel"
              onClick={() => setSaveDialogOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="user-detail-dialog-btn-primary"
              onClick={() => {
                setSaveDialogOpen(false);
                handleSave();
              }}
            >
              Confirmar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Desativar Usuário ── */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent className="user-detail-dialog">
          <DialogHeader>
            <div className="user-detail-dialog__header">
              <div className="user-detail-dialog__icon-wrap">
                <AlertTriangle size={24} className="user-detail-dialog__icon" />
              </div>
              <DialogTitle className="user-detail-dialog-title">
                Desativar usuário?
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="user-detail-dialog-text">
            O usuário será marcado como inativo no sistema. Deseja continuar?
          </p>
          <DialogFooter className="user-detail-dialog-actions">
            <button
              className="user-detail-dialog-btn-cancel"
              onClick={() => setDeactivateDialogOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="user-detail-dialog-btn-warn"
              onClick={() => {
                setDeactivateDialogOpen(false);
                setStatus("inativo");
                navigate("/app/usuarios");
              }}
            >
              Desativar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Reativar Usuário ── */}
      <Dialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
        <DialogContent className="user-detail-dialog">
          <DialogHeader>
            <div className="user-detail-dialog__header">
              <div className="user-detail-dialog__icon-wrap user-detail-dialog__icon-wrap--green">
                <RefreshCw size={24} className="user-detail-dialog__icon" />
              </div>
              <DialogTitle className="user-detail-dialog-title">
                Reativar usuário?
              </DialogTitle>
            </div>
          </DialogHeader>
          <p className="user-detail-dialog-text">
            O usuário será marcado como ativo no sistema. Deseja continuar?
          </p>
          <DialogFooter className="user-detail-dialog-actions">
            <button
              className="user-detail-dialog-btn-cancel"
              onClick={() => setReactivateDialogOpen(false)}
            >
              Cancelar
            </button>
            <button
              className="user-detail-dialog-btn-success"
              onClick={() => {
                setReactivateDialogOpen(false);
                setStatus("ativo");
                navigate("/app/usuarios");
              }}
            >
              Reativar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



