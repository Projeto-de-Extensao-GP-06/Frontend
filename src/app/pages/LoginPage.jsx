import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowRight, Lock, Mail, Scale } from "lucide-react";
import "../../styles/login-page.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  useEffect(() => {
    document.title = "Login";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Informe seu e-mail.";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = "Informe um e-mail válido.";
    }

    if (!password) {
      newErrors.password = "Informe sua senha.";
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = e => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/app/inicio");
    }, 900);
  };

  const handleEmailChange = e => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
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
            <form onSubmit={handleLogin} className="login-form" noValidate>

              {/* Email field */}
              <div className="login-field">
                <label className="login-field__label" htmlFor="login-email">
                  E-mail
                </label>
                <div className="login-field__input-wrap">
                  <Mail size={15} className="login-field__icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="seu@email.com"
                    className="login-field__input"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "login-email-error" : undefined}
                  />
                </div>
                {errors.email && <p id="login-email-error" className="login-field__error" role="alert">
                    {errors.email}
                  </p>}
              </div>

              {/* Password field */}
              <div className="login-field">
                <label className="login-field__label" htmlFor="login-password">
                  Senha
                </label>
                <div className="login-field__input-wrap">
                  <Lock size={15} className="login-field__icon" />
                  <input
                    id="login-password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="login-field__input login-field__input--password"
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="login-field__toggle">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" className="login-field__error" role="alert">
                    {errors.password}
                  </p>}
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