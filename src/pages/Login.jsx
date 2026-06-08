import { useState, useRef } from 'react'
import './Login.css'

// ── Mock ──────────────────────────────────────────────────
const MOCK_USER = {
  nome: 'Thauany',
  email: 'thauany@escritorio.com',
  senha: '123456',
  codigo: '123456',
}

const TELA = {
  LOGIN: 'login',
  REDEFINIR_EMAIL: 'redefinir_email',
  VERIFICAR_CODIGO: 'verificar_codigo',
  NOVA_SENHA: 'nova_senha',
}

// ── Ícones ────────────────────────────────────────────────
function IconBalanca() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 4-1 6-2 2 1 4 2 6 2h2" />
    </svg>
  )
}

function IconEmail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function IconCadeado() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function IconOlho({ aberto }) {
  if (aberto) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function IconVoltar() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}

// ── Logo compartilhada ────────────────────────────────────
function LogoHeader({ compact }) {
  return (
    <div className={`auth-logo-header${compact ? ' compact' : ''}`}>
      <div className="hexagon-outer">
        <div className="hexagon-inner">
          <IconBalanca />
        </div>
      </div>
      <h1 className="auth-titulo">SGPJ</h1>
      {!compact && (
        <>
          <p className="auth-subtitulo">
            Sistema Gerenciador de<br />Processos Judiciais
          </p>
          <div className="auth-separador">
            <span className="separador-dot" />
          </div>
        </>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────
function Login({ onLogin }) {
  const [tela, setTela] = useState(TELA.LOGIN)

  // Login
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Redefinir senha
  const [emailRedefinir, setEmailRedefinir] = useState('')
  const [digitos, setDigitos] = useState(['', '', '', '', '', ''])
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const inputsRef = useRef([])

  function limparMensagens() {
    setErro('')
    setSucesso('')
  }

  function voltarLogin() {
    setTela(TELA.LOGIN)
    setEmailRedefinir('')
    setDigitos(['', '', '', '', '', ''])
    setNovaSenha('')
    setConfirmarSenha('')
    limparMensagens()
  }

  // ── Handlers ─────────────────────────────────────────────
  function handleLogin(e) {
    e.preventDefault()
    limparMensagens()
    if (!email || !senha) { setErro('Preencha todos os campos.'); return }
    if (email !== MOCK_USER.email || senha !== MOCK_USER.senha) {
      setErro('E-mail ou senha incorretos.')
      return
    }
    onLogin()
  }

  function handleEnviarCodigo(e) {
    e.preventDefault()
    limparMensagens()
    if (!emailRedefinir) { setErro('Informe seu e-mail.'); return }
    setTela(TELA.VERIFICAR_CODIGO)
  }

  function handleDigitoChange(index, value) {
    if (!/^\d*$/.test(value)) return
    const novos = [...digitos]
    novos[index] = value.slice(-1)
    setDigitos(novos)
    if (value && index < 5) inputsRef.current[index + 1]?.focus()
  }

  function handleDigitoKeyDown(index, e) {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handleVerificarCodigo(e) {
    e.preventDefault()
    limparMensagens()
    const codigo = digitos.join('')
    if (codigo.length < 6) { setErro('Insira o código de 6 dígitos.'); return }
    if (codigo !== MOCK_USER.codigo) { setErro('Código inválido. Tente: 123456'); return }
    setTela(TELA.NOVA_SENHA)
  }

  function handleRedefinirSenha(e) {
    e.preventDefault()
    limparMensagens()
    if (!novaSenha || !confirmarSenha) { setErro('Preencha todos os campos.'); return }
    if (novaSenha.length < 6) { setErro('A senha deve ter no mínimo 6 caracteres.'); return }
    if (novaSenha !== confirmarSenha) { setErro('As senhas não coincidem.'); return }
    setSucesso('Senha redefinida com sucesso!')
    setTimeout(voltarLogin, 2000)
  }

  // ── Tela: Redefinir e-mail ───────────────────────────────
  if (tela === TELA.REDEFINIR_EMAIL) {
    return (
      <div className="auth-page">
        <LogoHeader compact />
        <div className="auth-card">
          <button className="btn-voltar" onClick={voltarLogin}>
            <IconVoltar /> Voltar
          </button>
          <div>
            <h2 className="card-titulo">Redefinir senha</h2>
            <p className="card-descricao">
              Enviaremos um código de verificação em seu e-mail. Por favor, insira-o abaixo para redefinir a senha.
            </p>
          </div>
          <form onSubmit={handleEnviarCodigo} noValidate>
            <div className="campo">
              <label htmlFor="email-redefinir">E-mail</label>
              <input
                id="email-redefinir"
                type="email"
                placeholder="seu@email.com"
                value={emailRedefinir}
                onChange={(e) => setEmailRedefinir(e.target.value)}
                autoComplete="email"
              />
            </div>
            {erro && <p className="auth-erro">{erro}</p>}
            <button type="submit" className="btn-primario">Enviar código</button>
          </form>
        </div>
      </div>
    )
  }

  // ── Tela: Verificar código ───────────────────────────────
  if (tela === TELA.VERIFICAR_CODIGO) {
    return (
      <div className="auth-page">
        <LogoHeader compact />
        <div className="auth-card">
          <button className="btn-voltar" onClick={() => { setTela(TELA.REDEFINIR_EMAIL); limparMensagens() }}>
            <IconVoltar /> Voltar
          </button>
          <div>
            <h2 className="card-titulo">Verificar código</h2>
            <p className="card-descricao">
              Enviamos um código para <strong>{emailRedefinir || MOCK_USER.email}</strong>. Insira-o abaixo.
            </p>
          </div>
          <form onSubmit={handleVerificarCodigo} noValidate>
            <div className="campo">
              <label>Código de verificação</label>
              <div className="otp-wrapper">
                {digitos.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitoChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitoKeyDown(i, e)}
                    placeholder="0"
                  />
                ))}
              </div>
            </div>
            {erro && <p className="auth-erro">{erro}</p>}
            <button type="submit" className="btn-primario">Verificar</button>
          </form>
        </div>
      </div>
    )
  }

  // ── Tela: Nova senha ─────────────────────────────────────
  if (tela === TELA.NOVA_SENHA) {
    return (
      <div className="auth-page">
        <LogoHeader compact />
        <div className="auth-card">
          <button className="btn-voltar" onClick={() => { setTela(TELA.VERIFICAR_CODIGO); limparMensagens() }}>
            <IconVoltar /> Voltar
          </button>
          <div>
            <h2 className="card-titulo">Olá, {MOCK_USER.nome}!</h2>
            <p className="card-descricao">Por favor, insira sua nova senha:</p>
          </div>
          <form onSubmit={handleRedefinirSenha} noValidate>
            <div className="campo">
              <label htmlFor="nova-senha">Nova senha</label>
              <div className="input-com-icone">
                <input
                  id="nova-senha"
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="btn-olho" onClick={() => setMostrarNovaSenha(v => !v)}>
                  <IconOlho aberto={mostrarNovaSenha} />
                </button>
              </div>
            </div>
            <div className="campo">
              <label htmlFor="confirmar-senha">Confirmar senha</label>
              <div className="input-com-icone">
                <input
                  id="confirmar-senha"
                  type={mostrarConfirmar ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="btn-olho" onClick={() => setMostrarConfirmar(v => !v)}>
                  <IconOlho aberto={mostrarConfirmar} />
                </button>
              </div>
            </div>
            {erro && <p className="auth-erro">{erro}</p>}
            {sucesso && <p className="auth-sucesso">{sucesso}</p>}
            <button type="submit" className="btn-primario">Redefinir senha</button>
          </form>
        </div>
      </div>
    )
  }

  // ── Tela: Login principal ─────────────────────────────────
  return (
    <div className="auth-page">
      <LogoHeader />
      <div className="auth-card">
        <div className="card-boas-vindas">
          <h2 className="card-titulo">Bem-vindo(a)!</h2>
          <p className="card-descricao">Acesse sua conta para continuar</p>
        </div>
        <form className="auth-form" onSubmit={handleLogin} noValidate>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <div className="input-com-icone">
              <span className="icone-prefixo"><IconEmail /></span>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <div className="input-com-icone">
              <span className="icone-prefixo"><IconCadeado /></span>
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="btn-olho" onClick={() => setMostrarSenha(v => !v)}>
                <IconOlho aberto={mostrarSenha} />
              </button>
            </div>
          </div>
          {erro && <p className="auth-erro">{erro}</p>}
          <button type="submit" className="btn-primario btn-entrar">
            Entrar <span className="seta">→</span>
          </button>
        </form>
        <div className="auth-links">
          <button
            type="button"
            className="link-auth"
            onClick={() => { setEmailRedefinir(''); limparMensagens(); setTela(TELA.REDEFINIR_EMAIL) }}
          >
            Esqueci a senha
          </button>
          <span className="link-separador">|</span>
          <button
            type="button"
            className="link-auth"
            onClick={() => { setEmailRedefinir(''); limparMensagens(); setTela(TELA.REDEFINIR_EMAIL) }}
          >
            Primeiro acesso
          </button>
        </div>
      </div>
      <div className="auth-rodape">
        <a href="#" className="rodape-link">Conhecer o escritório →</a>
        <p className="rodape-escritorio">Thauany Bezerra Advocacia</p>
      </div>
    </div>
  )
}

export default Login
