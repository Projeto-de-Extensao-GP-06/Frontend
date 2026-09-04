import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowRight, Lock, Mail, Scale } from "lucide-react";
import "../../styles/login-page.css";
export default function LoginPage() {
  useEffect(() => {
    document.title = "Login";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/app/inicio");
    }, 900);
  };
  return <div className="login-page">
      <div className="login-page__content">

        {/* ── Brand mark ── */}
        <div className="login-page__brand">
          <div className="login-page__brand-mark-wrap">
            <div className="login-page__brand-mark">
              <Scale size={36} className="login-page__brand-icon" strokeWidth={1.5} />
            </div>
            <div className="login-page__brand-glow" />
          </div>

          <h1 className="login-page__title">
            SGPJ
          </h1>
          <p className="login-page__subtitle">
            Sistema Gerenciador de Processos Judiciais
          </p>

          <div className="login-page__divider">
            <div className="login-page__divider-line" />
            <div className="login-page__divider-dot" />
            <div className="login-page__divider-line" />
          </div>
        </div>

        {/* ── Login card ── */}
        <div className="login-card">

          {/* Card header stripe */}
          <div className="login-card__header">
            <h2 className="login-card__title">
              Bem-vindo(a)!
            </h2>
            <p className="login-card__subtitle">Acesse sua conta para continuar</p>
          </div>

          <div className="login-card__body">
            <form onSubmit={handleLogin} className="login-form">

              {/* Email field */}
              <div className="login-field">
                <label className="login-field__label">
                  E-mail
                </label>
                <div className="login-field__input-wrap">
                  <Mail size={15} className="login-field__icon" />
                  <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="login-field__input" />
                </div>
              </div>

              {/* Password field */}
              <div className="login-field">
                <label className="login-field__label">
                  Senha
                </label>
                <div className="login-field__input-wrap">
                  <Lock size={15} className="login-field__icon" />
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="login-field__input login-field__input--password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="login-field__toggle">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="login-submit">
                {loading ? <div className="login-submit__spinner" /> : <>
                    Entrar
                    <ArrowRight size={17} />
                  </>}
              </button>
            </form>

            {/* Links */}
            <div className="login-links">
              <button onClick={() => navigate("/redefinir-senha?mode=redefinir")} className="login-links__button">
                Esqueci a senha
              </button>
              <div className="login-links__divider" />
              <button onClick={() => navigate("/redefinir-senha?mode=primeiro-acesso")} className="login-links__button">
                Primeiro acesso
              </button>
            </div>
          </div>
        </div>

        {/* Site público link */}
        <button onClick={() => navigate("/")} className="login-site-link">
          Conhecer o escritório
          <ArrowRight size={11} />
        </button>

        {/* Footer branding */}
        <p className="login-footer">
          Thauany Bezerra Advocacia
        </p>
      </div>
    </div>;
}