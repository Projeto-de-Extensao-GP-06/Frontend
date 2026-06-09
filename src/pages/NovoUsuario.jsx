import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideMenu from '../components/SideMenu'
import './NovoUsuario.css'

// ── Mock ──────────────────────────────────────────────────
const MOCK_CARGOS = ['Administrador', 'Advogado', 'Assistente']

const MOCK_USUARIO_LOGADO = {
  nome: 'Thauany',
  iniciais: 'TB',
  cargo: 'Administrador',
  especialidade: 'Advogada',
}

// ── Componente ────────────────────────────────────────────
export default function NovoUsuario({ usuarios, onCriarUsuario, onLogout }) {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [cargo, setCargo] = useState('Administrador')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  function handleCriarUsuario(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!nomeCompleto.trim()) { setErro('Informe o nome completo.'); return }
    if (!email.trim()) { setErro('Informe o e-mail.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro('Informe um e-mail válido.')
      return
    }

    const nomeCompletoTratado = nomeCompleto.trim()
    const emailTratado = email.trim()

    if (usuarios.some((usuario) => usuario.email.toLowerCase() === emailTratado.toLowerCase())) {
      setErro('Já existe um usuário cadastrado com este e-mail.')
      return
    }

    setCarregando(true)
    setTimeout(() => {
      onCriarUsuario({
        id: Date.now(),
        nomeCompleto: nomeCompletoTratado,
        email: emailTratado,
        cargo,
      })
      setCarregando(false)
      setSucesso(`Usuário "${nomeCompletoTratado}" cadastrado com sucesso.`)
      setNomeCompleto('')
      setEmail('')
      setCargo('Administrador')
    }, 1200)
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <span className="app-header-logo">SGPJ</span>
        <button
          className="btn-hamburger"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Menu lateral */}
      <SideMenu
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
        usuario={MOCK_USUARIO_LOGADO}
        paginaAtiva="usuarios"
        onLogout={onLogout}
      />

      {/* Conteúdo */}
      <main className="app-main">
        <div className="breadcrumb-nav">
          <button className="breadcrumb-voltar" onClick={() => navigate('/')}>
            ← Usuários
          </button>
        </div>
        <p className="breadcrumb-path">
          <span>USUÁRIOS</span>
          <span className="breadcrumb-sep">›</span>
          <span>NOVO</span>
        </p>

        <h1 className="pagina-titulo">Novo Usuário</h1>
        <p className="pagina-subtitulo">Preencha os dados para criar o acesso:</p>

        <form className="form-card" onSubmit={handleCriarUsuario} noValidate>
          <div className="campo-claro">
            <label htmlFor="nome">Nome Completo</label>
            <input
              id="nome"
              type="text"
              placeholder="Nome do usuário"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="campo-claro">
            <label htmlFor="email-usuario">E-mail</label>
            <input
              id="email-usuario"
              type="email"
              placeholder="email@escritorio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="campo-claro">
            <label htmlFor="cargo">Cargo</label>
            <select
              id="cargo"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              {MOCK_CARGOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {erro && <p className="form-erro">{erro}</p>}
          {sucesso && <p className="form-sucesso">{sucesso}</p>}

          <div className="form-acoes">
            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate('/')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-criar"
              disabled={carregando}
            >
              {carregando ? 'Criando...' : 'Criar usuário'}
            </button>
          </div>
        </form>

        <section className="usuarios-lista" aria-labelledby="usuarios-lista-titulo">
          <div className="usuarios-lista-cabecalho">
            <div>
              <h2 id="usuarios-lista-titulo">Usuários cadastrados</h2>
              <p>{usuarios.length} {usuarios.length === 1 ? 'usuário' : 'usuários'} na lista</p>
            </div>
          </div>

          {usuarios.length === 0 ? (
            <p className="usuarios-vazio">Nenhum usuário cadastrado ainda.</p>
          ) : (
            <ul className="usuarios-itens">
              {usuarios.map((usuario) => (
                <li key={usuario.id} className="usuario-item">
                  <div className="usuario-avatar" aria-hidden="true">
                    {usuario.nomeCompleto
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((parte) => parte[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="usuario-info">
                    <strong>{usuario.nomeCompleto}</strong>
                    <span>{usuario.email}</span>
                  </div>
                  <span className="usuario-cargo">{usuario.cargo}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
