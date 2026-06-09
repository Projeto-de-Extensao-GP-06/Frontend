import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import NovoUsuario from './pages/NovoUsuario'
import './App.css'

const USUARIOS_INICIAIS = [
  {
    id: 1,
    nomeCompleto: 'Thauany Barbosa',
    email: 'thauany@escritorio.com',
    cargo: 'Administrador',
  },
]

function App() {
  const [autenticado, setAutenticado] = useState(false)
  const [usuarios, setUsuarios] = useState(USUARIOS_INICIAIS)

  function adicionarUsuario(usuario) {
    setUsuarios((usuariosAtuais) => [usuario, ...usuariosAtuais])
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            autenticado
              ? <Navigate to="/usuarios/novo" replace />
              : <Login onLogin={() => setAutenticado(true)} />
          }
        />
        <Route
          path="/usuarios/novo"
          element={
            autenticado
              ? (
                <NovoUsuario
                  usuarios={usuarios}
                  onCriarUsuario={adicionarUsuario}
                  onLogout={() => setAutenticado(false)}
                />
              )
              : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
