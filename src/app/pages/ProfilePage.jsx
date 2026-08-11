import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Mail, Key, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import "../../styles/profile-page.css";
export default function ProfilePage() {
  const [showPass, setShowPass] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const navigate = useNavigate();
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
              <p className="profile-hero__role">Admin Advogada</p>
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
          <div className="profile-field">
            <p className="profile-field__label">E-mail</p>
            <div className="profile-field__value-box">
              <p className="profile-field__value">thauany@thauanybezerra.adv.br</p>
            </div>
          </div>
          <div className="profile-field">
            <p className="profile-field__label">Senha</p>
            <div className="profile-field__value-box profile-field__value-box--row">
              <p className="profile-field__password">{showPass ? "MinhaS3nh@" : "••••••••••"}</p>
              <button onClick={() => setShowPass(!showPass)} className="profile-field__toggle">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button onClick={() => setConfirmDialogOpen(true)} className="profile-change-password-btn">
            <Key size={15} />
            Alterar senha
          </button>
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

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
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
            <Button variant="outline" className="edit-process-dialog-button edit-process-dialog-button--outline" onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
            <Button className="edit-process-button edit-process-button--primary" style={{flex:1}} onClick={() => { setConfirmDialogOpen(false); navigate("/redefinir-senha"); }}>Continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}