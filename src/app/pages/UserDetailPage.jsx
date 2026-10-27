import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { ArrowLeft, User, Shield, AlertTriangle, Save, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import { getInitials } from "../components/UserAvatar";
import { listarUsuarios, atualizarUsuario, reativarUsuario } from "../services/usuarioService";
import { listarCargos } from "../services/cargoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import "../../styles/user-detail-page.css";

const normalizeUser = (user) => ({
  id: String(user.id),
  name: user.nome,
  email: user.email,
  role: user.cargoNome,
  cargoId: user.cargoId,
  status: user.ativo ? "ativo" : "inativo",
});

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const users = await listarUsuarios();
        const foundUser = users.find((u) => String(u.id) === id);
        if (foundUser) {
          setUser(normalizeUser(foundUser));
          document.title = `SGPJ | Usuário - ${foundUser.nome}`;
        }
      } catch (error) {
        toast.error(error.message || "Não foi possível carregar o usuário.");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  if (loading) return <div className="user-detail-page">Carregando...</div>;
  if (!user) return <Navigate to="/app/usuarios" replace />;

  return <UserDetail user={user} />;
}

function UserDetail({ user }) {
  const navigate = useNavigate();
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [status, setStatus] = useState(user.status);
  const [role, setRole] = useState(user.role);
  const [cargos, setCargos] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const isInactive = status === "inativo";

  useEffect(() => {
    const loadCargos = async () => {
      try {
        const data = await listarCargos({ size: 100 });
        const cargosList = Array.isArray(data) ? data : (data?.content || []);
        setCargos(cargosList);
      } catch (error) {
        toast.error(error.message || "Não foi possível carregar cargos.");
      }
    };
    loadCargos();
  }, []);

  const handleSave = async () => {
    const selectedCargo = cargos.find((c) => c.nome === role);
    if (!selectedCargo) {
      toast.error("Selecione um cargo válido.");
      return;
    }

    setSaving(true);
    try {
      await atualizarUsuario(user.id, {
        nome: name,
        email,
        cargoId: selectedCargo.cargoId,
        ativo: status === "ativo",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Usuário atualizado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível atualizar o usuário.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    const selectedCargo = cargos.find((c) => c.nome === role);
    setSaving(true);
    try {
      await atualizarUsuario(user.id, {
        nome: name,
        email,
        cargoId: selectedCargo?.cargoId,
        ativo: false,
      });
      setStatus("inativo");
      setDeactivateDialogOpen(false);
      navigate("/app/usuarios");
      toast.success("Usuário desativado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível desativar o usuário.");
    } finally {
      setSaving(false);
    }
  };

  const handleReactivate = async () => {
    setSaving(true);
    try {
      await reativarUsuario(user.id);
      setStatus("ativo");
      setReactivateDialogOpen(false);
      navigate("/app/usuarios");
      toast.success("Usuário reativado com sucesso.");
    } catch (error) {
      toast.error(error.message || "Não foi possível reativar o usuário.");
    } finally {
      setSaving(false);
    }
  };

  const initials = getInitials(name || user.name);

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
              {name || user.name}
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
            <User size={14} className="user-card__title-icon" />
            Informações e Acesso
          </h3>
          <div className="user-detail-field">
            <label className="user-detail-label">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="user-detail-input"
              placeholder="Nome do usuário"
            />
          </div>

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
              {cargos.map((cargo) => (
                <option key={cargo.cargoId} value={cargo.nome}>
                  {cargo.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSaveDialogOpen(true)}
            disabled={saving}
            className={`user-detail-btn-save ${
              saved ? "is-saved" : ""
            }`}
          >
            {saved ? (
              "✓ Salvo com sucesso"
            ) : (
              <>
                <Save size={15} />
                {saving ? "Salvando..." : "Salvar alterações"}
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
            Deseja salvar as alterações no cadastro de <strong className="user-detail-dialog__highlight">{name || user.name}</strong>?
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
              onClick={handleDeactivate}
              disabled={saving}
            >
              {saving ? "Desativando..." : "Desativar"}
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
              onClick={handleReactivate}
              disabled={saving}
            >
              {saving ? "Reativando..." : "Reativar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



