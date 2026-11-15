import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router";
import { ArrowLeft, User, Shield, AlertTriangle, Save, CheckCircle, RefreshCw, Info, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "../components/StatusBadge";
import { getInitials } from "../components/UserAvatar";
import { listarUsuarios, atualizarUsuario, desativarUsuario, reativarUsuario } from "../services/usuarioService";
import { listarCargos } from "../services/cargoService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { hasPermission, normalizePermission } from "../utils/permissions";
import "../../styles/user-detail-page.css";

const normalizeUser = (user) => ({
  id: String(user.id),
  name: user.nome,
  email: user.email,
  role: user.cargoNome,
  cargoId: user.cargoId,
  status: user.ativo ? "ativo" : "inativo",
});

const isAdminCargo = (cargoNome, cargoId, cargosList = []) => {
  if (
    String(cargoId) === "1" ||
    normalizePermission(cargoNome) === "ADMIN"
  ) {
    return true;
  }

  const foundCargo = cargosList.find(
    (c) =>
      String(c.cargoId ?? c.id) === String(cargoId) ||
      normalizePermission(c.nome) === normalizePermission(cargoNome)
  );

  if (!foundCargo || !Array.isArray(foundCargo.permissoes)) return false;

  return foundCargo.permissoes.some(
    (p) => normalizePermission(p?.nome ?? p) === "TODAS AS PERMISSÕES"
  );
};

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const users = await listarUsuarios();
        const usersList = Array.isArray(users) ? users : [];
        const normalizedList = usersList.map(normalizeUser);
        setAllUsers(normalizedList);

        const foundUser = normalizedList.find((u) => String(u.id) === String(id));
        if (foundUser) {
          setUser(foundUser);
          document.title = `SGPJ | Usuário - ${foundUser.name}`;
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

  return <UserDetail user={user} allUsers={allUsers} />;
}

function UserDetail({ user, allUsers }) {
  const navigate = useNavigate();
  const { user: loggedUser } = useAuth();
  const canEditUser = hasPermission(loggedUser, "EDITAR USUÁRIO");
  const canDeleteUser = hasPermission(loggedUser, "EXCLUIR USUÁRIO");
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

  const isOwnUser = useMemo(() => {
    if (!loggedUser) return false;
    if (loggedUser.id !== undefined && loggedUser.id !== null && String(user.id) === String(loggedUser.id)) {
      return true;
    }
    if (user.email && loggedUser.email) {
      return user.email.trim().toLowerCase() === loggedUser.email.trim().toLowerCase();
    }
    return false;
  }, [loggedUser, user.id, user.email]);

  const isLastActiveAdmin = useMemo(() => {
    const isCurrentActiveAdmin =
      status === "ativo" && isAdminCargo(user.role, user.cargoId, cargos);
    if (!isCurrentActiveAdmin) return false;

    const otherActiveAdminExists = (allUsers || []).some(
      (u) =>
        String(u.id) !== String(user.id) &&
        u.status === "ativo" &&
        isAdminCargo(u.role, u.cargoId, cargos)
    );

    return !otherActiveAdminExists;
  }, [allUsers, cargos, status, user.id, user.role, user.cargoId]);

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
    if (!canEditUser || isOwnUser) return;
    const selectedCargo = cargos.find((c) => c.nome === role);
    if (!selectedCargo) {
      toast.error("Selecione um cargo válido.");
      return;
    }

    const selectedCargoId = selectedCargo.cargoId ?? selectedCargo.id;
    if (isLastActiveAdmin && !isAdminCargo(selectedCargo.nome, selectedCargoId, cargos)) {
      toast.error("Não é possível alterar o cargo do único administrador ativo do sistema.");
      return;
    }

    setSaving(true);
    try {
      await atualizarUsuario(user.id, {
        nome: name.trim(),
        email: email.trim(),
        cargoId: selectedCargoId,
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
    if (!canDeleteUser || isOwnUser || isLastActiveAdmin) return;
    setSaving(true);
    try {
      await desativarUsuario(user.id);
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
    if (!canDeleteUser || isOwnUser) return;
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

  const personalDataTooltip = isOwnUser
    ? "Dados pessoais da sua própria conta devem ser alterados na tela de Meu Perfil."
    : !canEditUser
      ? "Sem permissão para editar usuário"
      : "";

  const cargoTooltip = isOwnUser
    ? "Você não pode alterar seu próprio cargo. Peça a outro administrador."
    : isLastActiveAdmin
      ? "Não é possível alterar o cargo do único administrador ativo do sistema."
      : isInactive
        ? "Reative o usuário para alterar seu cargo."
        : !canEditUser
          ? "Sem permissão para editar usuário"
          : "Selecionar cargo do usuário";

  const saveTooltip = isOwnUser
    ? "Você não pode alterar seu próprio registro por esta tela. Acesse 'Editar meu perfil'."
    : !canEditUser
      ? "Sem permissão para editar usuário"
      : "Salvar alterações";

  const deactivateTooltip = isOwnUser
    ? "Você não pode desativar sua própria conta. Peça a outro administrador."
    : isLastActiveAdmin
      ? "Não é possível desativar o único administrador ativo do sistema."
      : !canDeleteUser
        ? "Sem permissão para excluir/desativar usuário"
        : "Desativar Usuário";

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
            <div className="user-detail-name-row">
              <h1 className="user-detail-name">
                {name || user.name}
              </h1>
              {isOwnUser && (
                <span className="user-detail-self-badge">Você</span>
              )}
            </div>
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
        {/* Banner explicativo para o próprio usuário */}
        {isOwnUser && (
          <div className="user-detail-notice user-detail-notice--self" role="status">
            <div className="user-detail-notice__body">
              <Info size={18} className="user-detail-notice__icon" />
              <div className="user-detail-notice__copy">
                <p className="user-detail-notice__title">Este é o seu próprio usuário</p>
                <p className="user-detail-notice__text">
                  Por segurança, você não pode alterar seu próprio cargo nem desativar sua própria conta.
                  Para atualizar seus dados pessoais (nome, e-mail e senha), utilize a tela de Perfil.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/app/perfil")}
              className="user-detail-btn-profile-link"
            >
              <ExternalLink size={14} />
              Editar meu perfil
            </button>
          </div>
        )}

        {/* Banner explicativo para proteção do último administrador */}
        {!isOwnUser && isLastActiveAdmin && (
          <div className="user-detail-notice user-detail-notice--admin" role="status">
            <div className="user-detail-notice__body">
              <Shield size={18} className="user-detail-notice__icon" />
              <div className="user-detail-notice__copy">
                <p className="user-detail-notice__title">Proteção do último administrador</p>
                <p className="user-detail-notice__text">
                  Este usuário é o único administrador ativo do sistema. A alteração de cargo e a desativação
                  estão bloqueadas para impedir que o sistema fique sem administradores.
                </p>
              </div>
            </div>
          </div>
        )}

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
              disabled={!canEditUser || isOwnUser}
              title={personalDataTooltip}
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
              disabled={!canEditUser || isOwnUser}
              title={personalDataTooltip}
            />
            {isOwnUser && (
              <span className="user-detail-field-hint">
                Dados pessoais (nome e e-mail) devem ser editados em{" "}
                <button
                  type="button"
                  onClick={() => navigate("/app/perfil")}
                  className="user-detail-inline-link"
                >
                  Meu Perfil
                </button>.
              </span>
            )}
          </div>

          <div className="user-detail-field">
            <label className="user-detail-label">Cargo</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="user-detail-select"
              disabled={isInactive || !canEditUser || isOwnUser || isLastActiveAdmin}
              title={cargoTooltip}
            >
              {cargos.map((cargo) => (
                <option key={cargo.cargoId ?? cargo.id} value={cargo.nome}>
                  {cargo.nome}
                </option>
              ))}
            </select>
            {isOwnUser && (
              <span className="user-detail-field-hint">
                Você não pode alterar seu próprio cargo. Peça a outro administrador.
              </span>
            )}
            {!isOwnUser && isLastActiveAdmin && (
              <span className="user-detail-field-hint">
                Não é possível alterar o cargo do único administrador ativo do sistema.
              </span>
            )}
          </div>

          <button
            onClick={() => canEditUser && !isOwnUser && setSaveDialogOpen(true)}
            disabled={saving || !canEditUser || isOwnUser}
            title={saveTooltip}
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
          <div className="user-detail-deactivate-wrap">
            <button
              onClick={() => canDeleteUser && !isOwnUser && !isLastActiveAdmin && setDeactivateDialogOpen(true)}
              disabled={!canDeleteUser || isOwnUser || isLastActiveAdmin}
              title={deactivateTooltip}
              className="user-detail-btn-deactivate"
            >
              <AlertTriangle size={15} className="user-detail-dialog__icon" />
              Desativar Usuário
            </button>
            {(isOwnUser || isLastActiveAdmin) && (
              <p className="user-detail-action-hint">
                {isOwnUser
                  ? "Você não pode desativar sua própria conta. Peça a outro administrador."
                  : "Não é possível desativar o único administrador ativo do sistema."}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => canDeleteUser && !isOwnUser && setReactivateDialogOpen(true)}
            disabled={!canDeleteUser || isOwnUser}
            title={
              isOwnUser
                ? "Você não pode alterar o status da sua própria conta."
                : canDeleteUser
                  ? "Reativar Usuário"
                  : "Sem permissão para excluir/reativar usuário"
            }
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
