import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Key, Shield, CheckCircle, AlertCircle, Cloud, RefreshCw, Loader2, User, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { startOneDriveLogin } from "../services/oneDriveService";
import { buscarPerfilAtual, atualizarUsuario, salvarUsuarioLogado } from "../services/usuarioService";
import "../../styles/profile-page.css";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [confirmPassDialogOpen, setConfirmPassDialogOpen] = useState(false);
  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
  const [oneDriveLoading, setOneDriveLoading] = useState(false);
  const [oneDriveError, setOneDriveError] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { updateUser, logout } = useAuth();

  useEffect(() => {
    const onedriveStatus = searchParams.get("onedrive");
    if (!onedriveStatus) return;

    if (onedriveStatus === "connected") {
      toast.success("OneDrive reconectado com sucesso!");
    } else if (onedriveStatus === "error") {
      toast.error("Não foi possível reconectar o OneDrive. Tente novamente.");
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("onedrive");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    document.title = "SGPJ | Perfil";

    async function carregarPerfil() {
      try {
        setLoadingProfile(true);
        const usuario = await buscarPerfilAtual();
        if (usuario) {
          setCurrentUser(usuario);
          setName(usuario.nome || "");
          setEmail(usuario.email || "");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        toast.error("Não foi possível carregar os dados do perfil.");
      } finally {
        setLoadingProfile(false);
      }
    }

    carregarPerfil();
  }, []);

  const userRole = currentUser?.cargo?.nome || currentUser?.cargoNome || "Cargo não informado";
  const isAdmin = userRole?.toUpperCase() === "ADMIN" || userRole?.toLowerCase() === "administrador";
  const isActive = currentUser ? currentUser.ativo !== false : null;
  const permissions = Array.isArray(currentUser?.permissoes) ? currentUser.permissoes : [];

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US";

  const handleOpenSaveDialog = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setConfirmSaveDialogOpen(true);
  };

  const handleConfirmSaveChange = async () => {
    setConfirmSaveDialogOpen(false);
    if (!currentUser?.id) {
      toast.error("Identificador do usuário não encontrado.");
      return;
    }
    const cargoId = currentUser.cargo?.id || currentUser.cargoId;
    if (!cargoId) {
      toast.error("Não foi possível identificar o cargo da sua conta para salvar as alterações.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nome: name.trim(),
        email: email.trim(),
        cargoId,
        ativo: currentUser.ativo ?? true,
      };

      const emailMudou = email.trim().toLowerCase() !== (currentUser.email || "").trim().toLowerCase();
      const atualizado = await atualizarUsuario(currentUser.id, payload);

      if (emailMudou) {
        toast.success("E-mail atualizado com sucesso! Por segurança, faça login novamente com seu novo e-mail.", {
          duration: 6000,
        });
        setTimeout(async () => {
          try {
            await logout();
          } finally {
            navigate("/login");
          }
        }, 1800);
        return;
      }

      const novoUsuario = {
        ...currentUser,
        ...atualizado,
        nome: atualizado.nome || payload.nome,
        email: atualizado.email || payload.email,
        cargoNome: atualizado.cargoNome || currentUser.cargo?.nome || currentUser.cargoNome,
      };

      salvarUsuarioLogado(novoUsuario);
      updateUser(novoUsuario);
      setCurrentUser(novoUsuario);
      setSaved(true);
      toast.success("Informações salvas com sucesso!");
      setTimeout(() => {
        setSaved(false);
      }, 3500);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      const message = err?.response?.data?.message || err?.message || "Não foi possível salvar as alterações.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectOneDrive = async () => {
    setOneDriveError("");
    setOneDriveLoading(true);
    try {
      const { authUrl } = await startOneDriveLogin();
      window.location.href = authUrl;

    } catch (err) {
      console.error("Erro ao iniciar OneDrive:", err);
      const message = err?.response?.data?.message || (err instanceof Error ? err.message : "Não foi possível conectar ao OneDrive.");
      setOneDriveError(message);
      toast.error(message);
    } finally {
      setOneDriveLoading(false);
    }
  };

  return <div className="profile-page">

      {/* ── Navy Hero ── */}
      <div className="profile-hero">
        <div className="profile-hero__deco profile-hero__deco--tr" />
        <div className="profile-hero__deco profile-hero__deco--bl" />
        <div className="profile-hero__inner">
          <p className="profile-hero__kicker">SGPJ · Perfil</p>
          <div className="profile-hero__identity">
            <div className="profile-avatar">
              <span className="profile-avatar__initials">{initials}</span>
            </div>
            <div className="profile-hero__copy">
               <h1 className="profile-hero__name">{name || (loadingProfile ? "Carregando..." : "Perfil")}</h1>
              <p className="profile-hero__role">{userRole}</p>
              <div className="profile-hero__status">
                <div className="profile-hero__status-dot" />
                 <span className="profile-hero__status-label">{loadingProfile ? "Carregando..." : isActive ? "Ativo" : "Inativo"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="profile-content">
        <div className="profile-card">
          <h3 className="profile-card__title">
            <User size={14} className="profile-card__title-icon" />
            Informações da conta
          </h3>
          <form onSubmit={handleOpenSaveDialog}>
            <div className="profile-field">
              <label htmlFor="profile-name-input" className="profile-field__label">Nome completo</label>
              <input
                id="profile-name-input"
                type="text"
                className="profile-field__input"
                value={name}
                disabled={loadingProfile || saving}
                onChange={(e) => {
                  setName(e.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email-input" className="profile-field__label">E-mail</label>
              <input
                id="profile-email-input"
                type="email"
                className="profile-field__input"
                value={email}
                disabled={loadingProfile || saving}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (saved) setSaved(false);
                }}
                placeholder="seu.email@exemplo.adv.br"
                required
              />
            </div>

            {saved && (
              <div className="profile-feedback profile-feedback--success">
                <CheckCircle size={15} />
                <span>Alterações salvas com sucesso!</span>
              </div>
            )}

            <div className="profile-card__actions">
              <button type="submit" disabled={loadingProfile || saving} className="profile-save-email-btn">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmPassDialogOpen(true)}
                className="profile-change-password-btn"
              >
                <Key size={15} />
                Alterar senha
              </button>
            </div>
          </form>
        </div>

        <div className="profile-card">
          <h3 className="profile-card__title">
            <Shield size={14} className="profile-card__title-icon" />
            Acesso e permissões
          </h3>
          <div className="profile-role-row">
            <div className="profile-role-badge">
              <Shield size={16} className="profile-role-badge__icon" />
            </div>
            <div className="profile-role-info">
              <p className="profile-role-info__name">{userRole}</p>
            </div>
            <CheckCircle size={16} className="profile-role-check" />
          </div>
          <div className="profile-permissions">
            {permissions.length > 0
              ? permissions.map((permission) => (
                <span key={permission} className="profile-permission-chip">
                  {permission === "TODAS AS PERMISSÕES"
                    ? "Todas as permissões"
                    : permission.toLocaleLowerCase("pt-BR").replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("pt-BR"))}
                </span>
              ))
              : <span className="profile-permission-chip">Nenhuma permissão informada</span>}
          </div>
        </div>

        {isAdmin && (
          <div className="profile-card">
            <h3 className="profile-card__title">
              <Cloud size={14} className="profile-card__title-icon" />
              Integrações
            </h3>
            <div className="profile-integration-row">
              <div className="profile-integration-info">
                <p className="profile-integration-info__name">Microsoft OneDrive</p>
                <p className="profile-integration-info__hint">Reconecte caso o acesso aos arquivos do OneDrive expire.</p>
              </div>
            </div>

            {oneDriveError && (
              <div className="profile-feedback profile-feedback--error">
                <AlertCircle size={15} />
                <span>{oneDriveError}</span>
              </div>
            )}

            <div className="profile-card__actions">
              <button
                type="button"
                onClick={handleConnectOneDrive}
                disabled={oneDriveLoading}
                className="profile-onedrive-btn"
              >
                {oneDriveLoading ? <Loader2 size={15} className="profile-onedrive-btn__spinner" /> : <RefreshCw size={15} />}
                {oneDriveLoading ? "Conectando..." : "Reconectar OneDrive"}
              </button>
            </div>
          </div>
        )}

        <div className="profile-footer">
          <p className="profile-footer__text">SGPJ · Perfil da conta</p>
        </div>
      </div>

      {/* Modal de confirmação de alteração de informações */}
      <Dialog open={confirmSaveDialogOpen} onOpenChange={setConfirmSaveDialogOpen}>
        <DialogContent className="profile-dialog">
          <DialogHeader>
            <div className="profile-dialog__header">
              <div className="profile-dialog__icon-wrap profile-dialog__icon-wrap--blue">
                <User size={24} className="profile-dialog__icon" />
              </div>
              <DialogTitle className="profile-dialog__title">Salvar alterações</DialogTitle>
            </div>
          </DialogHeader>
          <p className="profile-dialog__text">
            Tem certeza de que deseja salvar as alterações nas informações da sua conta?
          </p>
          <DialogFooter className="profile-dialog__footer">
            <Button variant="outline" className="profile-dialog-button profile-dialog-button--outline" onClick={() => setConfirmSaveDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button className="profile-dialog-button profile-dialog-button--primary" onClick={handleConfirmSaveChange} disabled={saving}>
              {saving ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de alteração de senha */}
      <Dialog open={confirmPassDialogOpen} onOpenChange={setConfirmPassDialogOpen}>
        <DialogContent className="profile-dialog">
          <DialogHeader>
            <div className="profile-dialog__header">
              <div className="profile-dialog__icon-wrap">
                <AlertCircle size={24} className="profile-dialog__icon" />
              </div>
              <DialogTitle className="profile-dialog__title">Alterar senha</DialogTitle>
            </div>
          </DialogHeader>
          <p className="profile-dialog__text">
            Você será redirecionado para a tela de alteração de senha e será desconectado do sistema. Deseja continuar?
          </p>
          <DialogFooter className="profile-dialog__footer">
            <Button variant="outline" className="profile-dialog-button profile-dialog-button--outline" onClick={() => setConfirmPassDialogOpen(false)}>Cancelar</Button>
            <Button className="profile-dialog-button profile-dialog-button--primary" onClick={() => { setConfirmPassDialogOpen(false); navigate("/redefinir-senha?mode=redefinir"); }}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}
