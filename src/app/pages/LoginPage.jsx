import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, ArrowRight, Lock, Mail, Scale } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ApiErrorBanner } from "../components/ApiErrorBanner";
import { toast } from "sonner";
import "../../styles/login-page.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const location = useLocation();

  useEffect(() => {
    document.title = "Login";
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  // Proteção contra brute-force: bloqueia temporariamente após 5 tentativas falhas
  const [failCount, setFailCount] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState(null);

  const isBlocked = blockedUntil && Date.now() < blockedUntil;
  const BLOCK_DURATION_MS = 30_000; // 30 segundos
  const MAX_ATTEMPTS = 5;

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    if (isBlocked) {
      const remaining = Math.ceil((blockedUntil - Date.now()) / 1000);
      setApiError(`Muitas tentativas. Aguarde ${remaining} segundos.`);
      return;
    }

    if (!validate()) return;
    setLoading(true);

    try {
      // Chama o authService através do AuthProvider                                                                                                                                                       
      await login(email.trim(), password);

      // Sucesso! Reseta o contador e redireciona para a área interna                                                                                                                                                          
      setFailCount(0);
      setBlockedUntil(null);
      navigate("/app/inicio");
    } catch (err) {
      // O interceptor do axios já formatou a mensagem amigável em err.message                                                                                                                             
      const newCount = failCount + 1;
      setFailCount(newCount);

      if (newCount >= MAX_ATTEMPTS) {
        setBlockedUntil(Date.now() + BLOCK_DURATION_MS);
        setApiError(`Muitas tentativas incorretas. Tente novamente em 30 segundos.`);
      } else {
        setApiError(err.message || "Falha ao realizar login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = e => {
    setEmail(e.target.value);
    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    if (apiError) setApiError("");
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    if (apiError) setApiError("");
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
            <ApiErrorBanner message={apiError} />


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
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="login-field__toggle"
                  aria-label={showPass ? "Ocultar senha" : "Ver senha"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p id="login-password-error" className="login-field__error" role="alert">
                {errors.password}
              </p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || isBlocked} className="login-submit">
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
};