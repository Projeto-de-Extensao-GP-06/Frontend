import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Key, Shield, CheckCircle, AlertCircle, Cloud, RefreshCw, Loader2, User, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { startOneDriveLogin } from "../services/oneDriveService";
import "../../styles/profile-page.css";

export default function ProfilePage() {
  useEffect(() => {
    document.title = "Perfil";
  }, []);

  // TODO: substituir por role vinda de autenticação real quando existir.
  const userRole = "Administrador";
  const isAdmin = userRole === "Administrador";

  const [name, setName] = useState("Thauany Bezerra");
  const [email, setEmail] = useState("thauany@thauanybezerra.adv.br");
  const [saved, setSaved] = useState(false);
  const [confirmPassDialogOpen, setConfirmPassDialogOpen] = useState(false);
  const [confirmSaveDialogOpen, setConfirmSaveDialogOpen] = useState(false);
  const [oneDriveLoading, setOneDriveLoading] = useState(false);
  const [oneDriveError, setOneDriveError] = useState("");
  const navigate = useNavigate();

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "TB";

  const handleOpenSaveDialog = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setConfirmSaveDialogOpen(true);
  };

  const handleConfirmSaveChange = () => {
    setConfirmSaveDialogOpen(false);
    setSaved(true);
    toast.success("Informações salvas com sucesso!");
    setTimeout(() => {
      setSaved(false);
    }, 3500);
  };

  const handleConnectOneDrive = async () => {
    setOneDriveError("");
    setOneDriveLoading(true);
    try {
      const { authUrl } = await startOneDriveLogin();
      window.location.href = authUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível conectar ao OneDrive.";
      setOneDriveError(message);
      toast.error(message);
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
              <h1 className="profile-hero__name">{name || "Thauany Bezerra"}</h1>
              <p className="profile-hero__role">Administrador</p>
              <div className="profile-hero__status">
                <div className="profile-hero__status-dot" />
                <span className="profile-hero__status-label">Ativo</span>
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
              <button type="submit" className="profile-save-email-btn">
                <Save size={15} />
                Salvar alterações
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
              <p className="profile-role-info__name">Administrador</p>
            </div>
            <CheckCircle size={16} className="profile-role-check" />
          </div>
          <div className="profile-permissions">
            {["Processos", "Clientes", "Usuários", "Cargos", "Documentos"].map(perm => <span key={perm} className="profile-permission-chip">{perm}</span>)}
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
          <p className="profile-footer__text">Thauany Bezerra Advocacia · SGPJ v1.0</p>
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
            <Button variant="outline" className="profile-dialog-button profile-dialog-button--outline" onClick={() => setConfirmSaveDialogOpen(false)}>Cancelar</Button>
            <Button className="profile-dialog-button profile-dialog-button--primary" onClick={handleConfirmSaveChange}>Confirmar</Button>
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