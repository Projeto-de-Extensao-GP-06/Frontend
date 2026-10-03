import "../../styles/status-badge.css";
import { formatLabel } from "../utils/format";

// "Média" / "MEDIA" / "média" -> "media" (evita depender de como o banco grava)
const normalizar = (valor) =>
  String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function StatusBadge({ status, className = "" }) {
  const styles = {
    ativo: "status-badge--active",
    ativa: "status-badge--active",
    encerrado: "status-badge--closed",
    inativo: "status-badge--inactive",
    inativa: "status-badge--inactive",
    suspenso: "status-badge--inactive",
    suspensa: "status-badge--inactive",
    pendente: "status-badge--pending",
    aceita: "status-badge--accepted",
    negada: "status-badge--denied",
  };
  const labels = {
    ativo: "Ativo",
    ativa: "Ativa",
    encerrado: "Encerrado",
    inativo: "Inativo",
    inativa: "Inativa",
    suspenso: "Suspenso",
    suspensa: "Suspensa",
    pendente: "Pendente",
    aceita: "Aceita",
    negada: "Negada",
  };
  const key = normalizar(status);

  return (
    <span className={`status-badge ${styles[key] || styles.inativo} ${className}`.trim()}>
      {labels[key] || formatLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority, className = "" }) {
  const styles = {
    alta: "priority-badge--high",
    media: "priority-badge--medium",
    baixa: "priority-badge--low",
  };
  const labels = {
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
  };
  const key = normalizar(priority);

  return (
    <span className={`priority-badge ${styles[key] || styles.baixa} ${className}`.trim()}>
      {labels[key] || formatLabel(priority)}
    </span>
  );
}

export function PhaseBadge({ phase, className = "" }) {
  return <span className={`phase-badge ${className}`.trim()}>{formatLabel(phase)}</span>;
}