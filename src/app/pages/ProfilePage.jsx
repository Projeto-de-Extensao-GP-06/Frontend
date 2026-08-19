import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Key, Shield, CheckCircle, AlertCircle, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import "../../styles/profile-page.css";

export default function ProfilePage() {
  useEffect(() => {
    document.title = "Perfil";
  }, []);

  const [email, setEmail] = useState("thauany@thauanybezerra.adv.br");
  const [emailSaved, setEmailSaved] = useState(false);
  const [confirmPassDialogOpen, setConfirmPassDialogOpen] = useState(false);
  const [confirmEmailDialogOpen, setConfirmEmailDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenEmailDialog = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setConfirmEmailDialogOpen(true);
  };

  const handleConfirmEmailChange = () => {
    setConfirmEmailDialogOpen(false);
    setEmailSaved(true);
    setTimeout(() => {
      setEmailSaved(false);
    }, 3500);
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
              <span className="profile-avatar__initials">TB</span>
            </div>
            <div className="profile-hero__copy">
              <h1 className="profile-hero__name">Thauany Bezerra</h1>
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
            <Mail size={14} className="profile-card__title-icon" />
            Informações da conta
          </h3>
          <form onSubmit={handleOpenEmailDialog}>
            <div className="profile-field">
              <label htmlFor="profile-email-input" className="profile-field__label">E-mail</label>
              <input
                id="profile-email-input"
                type="email"
                className="profile-field__input"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailSaved) setEmailSaved(false);
                }}
                placeholder="seu.email@exemplo.adv.br"
                required
              />
            </div>

            {emailSaved && (
              <div className="profile-feedback profile-feedback--success">
                <CheckCircle size={15} />
                <span>E-mail atualizado com sucesso!</span>
              </div>
            )}

            <div className="profile-card__actions">
              <button type="submit" className="profile-save-email-btn">
                <Check size={15} />
                Confirmar mudança de e-mail
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
        <div className="profile-footer">
          <p className="profile-footer__text">Thauany Bezerra Advocacia · SGPJ v1.0</p>
        </div>
      </div>

      {/* Modal de confirmação de alteração de e-mail */}
      <Dialog open={confirmEmailDialogOpen} onOpenChange={setConfirmEmailDialogOpen}>
        <DialogContent className="profile-dialog">
          <DialogHeader>
            <div className="profile-dialog__header">
              <div className="profile-dialog__icon-wrap profile-dialog__icon-wrap--blue">
                <Mail size={24} className="profile-dialog__icon" />
              </div>
              <DialogTitle className="profile-dialog__title">Confirmar alteração de e-mail</DialogTitle>
            </div>
          </DialogHeader>
          <p className="profile-dialog__text">
            Tem certeza de que deseja alterar seu e-mail para <strong className="profile-dialog__highlight">{email}</strong>?
          </p>
          <DialogFooter className="profile-dialog__footer">
            <Button variant="outline" className="profile-dialog-button profile-dialog-button--outline" onClick={() => setConfirmEmailDialogOpen(false)}>Cancelar</Button>
            <Button className="profile-dialog-button profile-dialog-button--primary" onClick={handleConfirmEmailChange}>Confirmar</Button>
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