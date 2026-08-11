import "../../styles/status-badge.css";

export function StatusBadge({
  status,
  className = ""
}) {
  const styles = {
    ativo: "status-badge--active",
    ativa: "status-badge--active",
    encerrado: "status-badge--closed",
    inativo: "status-badge--inactive",
    inativa: "status-badge--inactive",
    pendente: "status-badge--pending",
    aceita: "status-badge--accepted",
    negada: "status-badge--denied"
  };
  const labels = {
    ativo: "Ativo",
    ativa: "Ativa",
    encerrado: "Encerrado",
    inativo: "Inativo",
    inativa: "Inativa",
    pendente: "Pendente",
    aceita: "Aceita",
    negada: "Negada"
  };
  return <span className={`status-badge ${styles[status] || styles.inativo} ${className}`.trim()}>
      {labels[status] || status}
    </span>;
}
export function PriorityBadge({
  priority,
  className = ""
}) {
  const styles = {
    alta: "priority-badge--high",
    média: "priority-badge--medium",
    baixa: "priority-badge--low"
  };
  const labels = {
    alta: "Alta",
    média: "Média",
    baixa: "Baixa"
  };
  return <span className={`priority-badge ${styles[priority] || styles.baixa} ${className}`.trim()}>
      {labels[priority] || priority}
    </span>;
}
export function PhaseBadge({
  phase,
  className = ""
}) {
  return <span className={`phase-badge ${className}`.trim()}>
      {phase}
    </span>;
}