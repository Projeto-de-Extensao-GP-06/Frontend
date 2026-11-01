import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldAlert, Home } from "lucide-react";
import "../../styles/access-denied-page.css";

export default function AccessDeniedPage({
  title = "Acesso Restrito",
  resourceName,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "SGPJ | Acesso Restrito";
  }, []);

  return (
    <div className="access-denied-page" role="alert">
      <div className="access-denied-card">
        <div className="access-denied-icon-wrap">
          <ShieldAlert size={28} />
        </div>

        <p className="access-denied-kicker">Permissão insuficiente</p>
        <h1 className="access-denied-title">{title}</h1>

        <p className="access-denied-description">
          {resourceName ? (
            <>
              Você não possui permissão para acessar <strong>{resourceName}</strong>.
              {" "}Solicite ao administrador do sistema a liberação de acesso para o seu cargo.
            </>
          ) : (
            "Você não possui as permissões necessárias vinculadas ao seu cargo para acessar esta página."
          )}
        </p>

        <div className="access-denied-actions">
          <button
            type="button"
            onClick={() => navigate("/app/inicio")}
            className="access-denied-btn access-denied-btn--primary"
          >
            <Home size={15} />
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  );
}
