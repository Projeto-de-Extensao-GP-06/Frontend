import { useState } from 'react'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }

    // TODO: chamar a API de autenticação
    console.log('Login com:', { email, senha })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-titulo">SGPJ</h1>
        <p className="login-subtitulo">Faça login para continuar</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="btn-entrar">
            Entrar
          </button>
        </form>

        <a href="#" className="link-esqueci">
          Esqueceu sua senha?
        </a>
      </div>
    </div>
  )
}

export default Login
