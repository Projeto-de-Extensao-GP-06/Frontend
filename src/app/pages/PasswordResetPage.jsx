import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { ArrowLeft, Scale, Eye, EyeOff, Check, Circle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { authService } from "../services/authService";
import "../../styles/password-reset-page.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isFirstAccess =
    searchParams.get("mode") === "primeiro-acesso" ||
    location.state?.mode === "primeiro-acesso";

  const title = isFirstAccess ? "Definir Senha" : "Redefinir Senha";

  useEffect(() => {
    document.title = title;
  }, [title]);

  // Controle de etapas do fluxo: "email" -> "code" -> "newpass"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Visibilidade de senhas
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Estados de feedback e erros
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // Regras de validação da nova senha
  const passwordRules = [
    {
      id: "length",
      label: "Mínimo de 8 caracteres (máximo de 255)",
      met: newPass.length >= 8 && newPass.length <= 255,
    },
    {
      id: "uppercase",
      label: "Pelo menos 1 letra maiúscula",
      met: /[A-Z]/.test(newPass),
    },
    {
      id: "lowercase",
      label: "Pelo menos 1 letra minúscula",
      met: /[a-z]/.test(newPass),
    },
    {
      id: "number",
      label: "Pelo menos 1 número",
      met: /[0-9]/.test(newPass),
    },
    {
      id: "special",
      label: "Pelo menos 1 caractere especial (!@#$%...)",
      met: /[^A-Za-z0-9]/.test(newPass),
    },
  ];

  const validateEmail = () => {
    const newErrors = {};
    const trimmed = email.trim();

    if (!trimmed) {
      newErrors.email = "Informe seu e-mail.";
    } else if (!EMAIL_REGEX.test(trimmed)) {
      newErrors.email = "Informe um e-mail válido.";
    } else if (trimmed.length > 255) {
      newErrors.email = "O e-mail deve ter no máximo 255 caracteres.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCode = () => {
    const newErrors = {};
    const trimmed = code.trim();

    if (!trimmed) {
      newErrors.code = "Informe o código de verificação.";
    } else if (!/^\d{6}$/.test(trimmed)) {
      newErrors.code = "O código deve conter exatamente 6 números.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPass = () => {
    const newErrors = {};

    if (!newPass) {
      newErrors.newPass = "Informe a nova senha.";
    } else if (newPass.length < 8) {
      newErrors.newPass = "A senha deve conter pelo menos 8 caracteres.";
    } else if (newPass.length > 255) {
      newErrors.newPass = "A senha deve conter no máximo 255 caracteres.";
    } else if (!/[A-Z]/.test(newPass)) {
      newErrors.newPass = "A senha deve conter pelo menos 1 letra maiúscula.";
    } else if (!/[a-z]/.test(newPass)) {
      newErrors.newPass = "A senha deve conter pelo menos 1 letra minúscula.";
    } else if (!/[0-9]/.test(newPass)) {
      newErrors.newPass = "A senha deve conter pelo menos 1 número.";
    } else if (!/[^A-Za-z0-9]/.test(newPass)) {
      newErrors.newPass = "A senha deve conter pelo menos 1 caractere especial.";
    }

    if (!confirmPass) {
      newErrors.confirmPass = "Confirme sua nova senha.";
    } else if (newPass !== confirmPass) {
      newErrors.confirmPass = "As senhas não coincidem.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
    if (apiError) setApiError("");
  };

  const handleCodeChange = (e) => {
    // Permite apenas dígitos numéricos
    const numericValue = e.target.value.replace(/\D/g, "");
    setCode(numericValue);
    if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
    if (apiError) setApiError("");
  };

  const handleNewPassChange = (e) => {
    setNewPass(e.target.value);
    if (errors.newPass) setErrors((prev) => ({ ...prev, newPass: undefined }));
    if (errors.confirmPass && confirmPass && e.target.value === confirmPass) {
      setErrors((prev) => ({ ...prev, confirmPass: undefined }));
    }
    if (apiError) setApiError("");
  };

  const handleConfirmPassChange = (e) => {
    setConfirmPass(e.target.value);
    if (errors.confirmPass) setErrors((prev) => ({ ...prev, confirmPass: undefined }));
    if (apiError) setApiError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateEmail()) return;
    setLoading(true);

    try {
      if (isFirstAccess) {
        await authService.enviarDefinirSenhaOtp(email.trim());
      } else {
        await authService.enviarRedefinirSenhaOtp(email.trim());
      }
      setErrors({});
      setStep("code");
    } catch (err) {
      setApiError(err.message || "Erro ao solicitar código. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateCode()) return;
    setLoading(true);

    try {
      // Esta chamada grava no navegador o cookie temporário HttpOnly (Path=/auth)
      await authService.validarOtp(email.trim(), code.trim());
      setErrors({});
      setStep("newpass");
    } catch (err) {
      setApiError(err.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPassSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateNewPass()) return;
    setLoading(true);

    try {
      // O Axios envia o cookie temporário gerado no validarOtp automaticamente (withCredentials: true)
      await authService.definirNovaSenha(newPass);

      // Sucesso! Redireciona para o login com mensagem no state
      navigate("/login", {
        state: { message: "Senha cadastrada com sucesso! Acesse sua conta." },
      });
    } catch (err) {
      setApiError(err.message || "Erro ao salvar nova senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pwd-page">
      <div className="pwd-page__inner">
        <div className="pwd-brand">
          <div className="pwd-brand__mark">
            <Scale size={26} className="pwd-brand__icon" />
          </div>
          <h1 className="pwd-brand__title">SGPJ</h1>
        </div>

        <div className="pwd-card">
          <button
            onClick={() => {
              setErrors({});
              setApiError("");
              if (step === "email") {
                navigate("/login");
              } else if (step === "code") {
                setStep("email");
              } else {
                setStep("code");
              }
            }}
            className="pwd-card__back"
            type="button"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          {/* Banner de Erro Geral da API */}
          {apiError && (
            <div
              role="alert"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.15)",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                borderRadius: "0.625rem",
                padding: "0.625rem 0.875rem",
                color: "#fca5a5",
                fontSize: "0.8125rem",
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              {apiError}
            </div>
          )}

          {/* ── ETAPA 1: SOLICITAÇÃO DO E-MAIL ── */}
          {step === "email" && (
            <>
              <h2 className="pwd-card__title">{title}</h2>
              <p className="pwd-card__desc">
                {isFirstAccess
                  ? "Enviaremos um código de verificação em seu e-mail para que você possa definir sua primeira senha."
                  : "Enviaremos um código de verificação em seu e-mail para que você possa redefinir sua senha."}
              </p>
              <form onSubmit={handleEmailSubmit} className="pwd-form" noValidate>
                <div className="pwd-field">
                  <Label className="pwd-field__label" htmlFor="pwd-email">
                    E-mail
                  </Label>
                  <Input
                    id="pwd-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    className="pwd-field__input"
                    maxLength={255}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "pwd-email-error" : undefined}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p id="pwd-email-error" className="pwd-field__error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="pwd-submit">
                  {loading ? "Enviando..." : "Enviar código"}
                </Button>
              </form>
            </>
          )}

          {/* ── ETAPA 2: DIGITAÇÃO E VALIDAÇÃO DO CÓDIGO OTP ── */}
          {step === "code" && (
            <>
              <h2 className="pwd-card__title">Verificar código</h2>
              <p className="pwd-card__desc">
                Enviamos um código para{" "}
                <strong className="pwd-card__email">{email}</strong>. Insira-o abaixo.
              </p>
              <form onSubmit={handleCodeSubmit} className="pwd-form" noValidate>
                <div className="pwd-field">
                  <Label className="pwd-field__label" htmlFor="pwd-code">
                    Código de verificação
                  </Label>
                  <Input
                    id="pwd-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={handleCodeChange}
                    className="pwd-field__input pwd-field__input--code"
                    maxLength={6}
                    aria-invalid={!!errors.code}
                    aria-describedby={errors.code ? "pwd-code-error" : undefined}
                    autoComplete="one-time-code"
                  />
                  {errors.code && (
                    <p id="pwd-code-error" className="pwd-field__error" role="alert">
                      {errors.code}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="pwd-submit">
                  {loading ? "Validando..." : "Verificar"}
                </Button>
              </form>
            </>
          )}

          {/* ── ETAPA 3: DEFINIÇÃO DA NOVA SENHA ── */}
          {step === "newpass" && (
            <>
              <h2 className="pwd-card__title">
                {isFirstAccess ? "Criar Senha" : "Nova Senha"}
              </h2>
              <p className="pwd-card__desc">
                Crie uma senha forte seguindo as instruções abaixo:
              </p>

              <form onSubmit={handleNewPassSubmit} className="pwd-form" noValidate>
                {/* Campo Nova Senha */}
                <div className="pwd-field">
                  <Label className="pwd-field__label" htmlFor="pwd-newpass">
                    Nova senha
                  </Label>
                  <div className="pwd-field__input-wrap">
                    <Input
                      id="pwd-newpass"
                      type={showNewPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPass}
                      onChange={handleNewPassChange}
                      className="pwd-field__input pwd-field__input--password"
                      maxLength={255}
                      aria-invalid={!!errors.newPass}
                      aria-describedby={errors.newPass ? "pwd-newpass-error" : undefined}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="pwd-field__toggle"
                      aria-label={showNewPass ? "Ocultar nova senha" : "Ver nova senha"}
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPass && (
                    <p id="pwd-newpass-error" className="pwd-field__error" role="alert">
                      {errors.newPass}
                    </p>
                  )}
                </div>

                {/* Bloco de Instruções e Requisitos de Senha */}
                <div className="pwd-rules" aria-live="polite">
                  <span className="pwd-rules__title">Requisitos da senha:</span>
                  <ul className="pwd-rules__list">
                    {passwordRules.map((rule) => (
                      <li
                        key={rule.id}
                        className={`pwd-rules__item ${rule.met ? "is-met" : ""}`}
                      >
                        {rule.met ? (
                          <Check size={14} className="pwd-rules__icon" />
                        ) : (
                          <Circle size={10} className="pwd-rules__icon" />
                        )}
                        <span>{rule.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Campo Confirmar Senha */}
                <div className="pwd-field">
                  <Label className="pwd-field__label" htmlFor="pwd-confirmpass">
                    Confirmar senha
                  </Label>
                  <div className="pwd-field__input-wrap">
                    <Input
                      id="pwd-confirmpass"
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPass}
                      onChange={handleConfirmPassChange}
                      className="pwd-field__input pwd-field__input--password"
                      maxLength={255}
                      aria-invalid={!!errors.confirmPass}
                      aria-describedby={errors.confirmPass ? "pwd-confirmpass-error" : undefined}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="pwd-field__toggle"
                      aria-label={showConfirmPass ? "Ocultar confirmação de senha" : "Ver confirmação de senha"}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPass && (
                    <p id="pwd-confirmpass-error" className="pwd-field__error" role="alert">
                      {errors.confirmPass}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="pwd-submit">
                  {loading
                    ? "Salvando..."
                    : isFirstAccess
                    ? "Definir senha"
                    : "Redefinir senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}