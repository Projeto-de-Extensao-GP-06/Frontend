import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { criarUsuario } from "../services/usuarioService";
import { listarCargos } from "../services/cargoService";
import "../../styles/new-user-page.css";

export default function NewUserPage() {
  useEffect(() => {
    document.title = "SGPJ | Novo Usuário";
  }, []);

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [cargos, setCargos] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const loadCargos = async () => {
      try {
        const data = await listarCargos({ size: 100 });
        const cargosList = Array.isArray(data) ? data : (data?.content || []);
        setCargos(cargosList);
        if (cargosList.length > 0) {
          setRole(cargosList[0].nome);
        }
      } catch (error) {
        toast.error(error.message || "Não foi possível carregar cargos.");
      }
    };
    loadCargos();
  }, []);

  const handleCreate = async () => {
    const selectedCargo = cargos.find((c) => c.nome === role);
    if (!name.trim() || !email.trim() || !selectedCargo) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setCreating(true);
    try {
      await criarUsuario({
        nome: name,
        email,
        cargoId: selectedCargo.cargoId,
      });
      toast.success("Usuário criado com sucesso.");
      navigate("/app/usuarios");
    } catch (error) {
      toast.error(error.message || "Não foi possível criar o usuário.");
    } finally {
      setCreating(false);
    }
  };

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
            disabled={cargos.length === 0}
          >
            {cargos.map((cargo) => (
              <option key={cargo.cargoId} value={cargo.nome}>
                {cargo.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="new-user-actions">
        <button
          onClick={() => navigate("/app/usuarios")}
          className="new-user-btn-cancel"
          disabled={creating}
        >
          Cancelar
        </button>
        <button
          onClick={handleCreate}
          className="new-user-btn-submit"
          disabled={creating}
        >
          <User size={15} />
          {creating ? "Criando..." : "Criar usuário"}
        </button>
      </div>
    </div>
  );
}

