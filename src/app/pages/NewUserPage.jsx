import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User } from "lucide-react";
import "../../styles/new-user-page.css";

export default function NewUserPage() {
  useEffect(() => {
    document.title = "Novo Usuário";
  }, []);

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Administrador");

  return (
    <div className="new-user-page">
      <button
        onClick={() => navigate("/app/usuarios")}
        className="new-user-back-link"
      >
        <ArrowLeft size={14} />
        Usuários
      </button>

      <div className="new-user-header">
        <p className="new-user-kicker">Usuários › Novo</p>
        <h1 className="new-user-title">Novo Usuário</h1>
        <p className="new-user-subtitle">
          Preencha os dados para criar o acesso:
        </p>
      </div>

      <div className="new-user-card">
        <div className="new-user-field">
          <label className="new-user-label">Nome Completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="new-user-input"
            placeholder="Nome do usuário"
          />
        </div>
        <div className="new-user-field">
          <label className="new-user-label">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="new-user-input"
            placeholder="email@escritorio.com"
          />
        </div>
        <div className="new-user-field">
          <label className="new-user-label">Cargo</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="new-user-select"
          >
            <option>Administrador</option>
            <option>Advogado</option>
            <option>Assistente</option>
          </select>
        </div>
      </div>

      <div className="new-user-actions">
        <button
          onClick={() => navigate("/app/usuarios")}
          className="new-user-btn-cancel"
        >
          Cancelar
        </button>
        <button
          onClick={() => navigate("/app/usuarios")}
          className="new-user-btn-submit"
        >
          <User size={15} />
          Criar usuário
        </button>
      </div>
    </div>
  );
}

