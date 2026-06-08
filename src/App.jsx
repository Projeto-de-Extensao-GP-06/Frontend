import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import NovoUsuario from './pages/NovoUsuario'
import './App.css'

function App() {
  const [autenticado, setAutenticado] = useState(false)

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
              ? <NovoUsuario onLogout={() => setAutenticado(false)} />
              : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
