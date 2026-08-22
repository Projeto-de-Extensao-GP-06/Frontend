import { User, Building2, ChevronRight, Check } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import "../../styles/clients-page.css";

export function ClientCard({
  client,
  onClick,
  selected = false,
  actions = null,
  showChevron = true,
  className = "",
}) {
  if (!client) return null;

  const isPF = client.type === "PF";
  const doc = isPF ? client.cpf : client.cnpj;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
      className={`client-card ${selected ? "is-selected" : ""} ${className}`.trim()}
    >
      {/* Card body */}
      <div className="client-card-body">
        {/* Avatar */}
        <div className={`client-card-avatar ${isPF ? "is-pf" : "is-pj"}`}>
          {isPF ? (
            <User size={18} className="client-card-avatar-icon is-pf" />
          ) : (
            <Building2 size={18} className="client-card-avatar-icon is-pj" />
          )}
        </div>

        {/* Info */}
        <div className="client-card-info">
          <div className="client-card-title-row">
            <p className="client-card-name" title={client.name}>
              {client.name}
            </p>
            <span className={`client-card-type ${isPF ? "is-pf" : "is-pj"}`}>
              {client.type}
            </span>
          </div>
          <p className="client-card-doc">{doc}</p>
        </div>

        {selected && (
          <div className="client-card-selected-badge" title="Selecionado">
            <Check size={16} />
          </div>
        )}

        {showChevron && !actions && !selected && (
          <ChevronRight size={15} className="client-card-chevron" />
        )}

        {actions && <div className="client-card-actions">{actions}</div>}
      </div>

      {/* Footer row */}
      <div className="client-card-footer">
        <p className="client-card-email" title={client.email}>
          {client.email}
        </p>
        <StatusBadge status={client.status} />
      </div>
    </div>
  );
}
