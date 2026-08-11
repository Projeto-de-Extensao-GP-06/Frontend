import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import "../../styles/password-reset-page.css";
export default function PasswordResetPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();
  const handleEmailSubmit = e => {
    e.preventDefault();
    setStep("code");
  };
  const handleCodeSubmit = e => {
    e.preventDefault();
    setStep("newpass");
  };
  const handleNewPassSubmit = e => {
    e.preventDefault();
    navigate("/");
  };
  return <div className="pwd-page">
      <div className="pwd-page__inner">
        <div className="pwd-brand">
          <div className="pwd-brand__mark">
            <Scale size={26} className="pwd-brand__icon" />
          </div>
          <h1 className="pwd-brand__title">SGPJ</h1>
        </div>

        <div className="pwd-card">
          <button onClick={() => step === "email" ? navigate("/") : setStep(step === "code" ? "email" : "code")} className="pwd-card__back">
            <ArrowLeft size={16} />
            Voltar
          </button>

          {step === "email" && <>
              <h2 className="pwd-card__title">Redefinir senha</h2>
              <p className="pwd-card__desc">Enviaremos um código de verificação em seu e-mail. Por favor, insira-o abaixo para redefinir a senha.</p>
              <form onSubmit={handleEmailSubmit} className="pwd-form">
                <div className="pwd-field">
                  <Label className="pwd-field__label">E-mail</Label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pwd-field__input" required />
                </div>
                <Button type="submit" className="pwd-submit">Enviar código</Button>
              </form>
            </>}

          {step === "code" && <>
              <h2 className="pwd-card__title">Verificar código</h2>
              <p className="pwd-card__desc">Enviamos um código para <strong className="pwd-card__email">{email}</strong>. Insira-o abaixo.</p>
              <form onSubmit={handleCodeSubmit} className="pwd-form">
                <div className="pwd-field">
                  <Label className="pwd-field__label">Código de verificação</Label>
                  <Input type="text" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} className="pwd-field__input pwd-field__input--code" maxLength={6} required />
                </div>
                <Button type="submit" className="pwd-submit">Verificar</Button>
              </form>
            </>}

          {step === "newpass" && <>
              <h2 className="pwd-card__title">Olá, Thauany!</h2>
              <p className="pwd-card__desc">Por favor, insira sua nova senha:</p>
              <form onSubmit={handleNewPassSubmit} className="pwd-form">
                <div className="pwd-field">
                  <Label className="pwd-field__label">Nova senha</Label>
                  <Input type="password" placeholder="••••••••" value={newPass} onChange={e => setNewPass(e.target.value)} className="pwd-field__input" required />
                </div>
                <div className="pwd-field">
                  <Label className="pwd-field__label">Confirmar senha</Label>
                  <Input type="password" placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="pwd-field__input" required />
                </div>
                <Button type="submit" className="pwd-submit">Redefinir senha</Button>
              </form>
            </>}
        </div>
      </div>
    </div>;
}