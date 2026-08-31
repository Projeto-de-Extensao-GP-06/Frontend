import { Calendar, ChevronRight, Check } from "lucide-react";
import { StatusBadge, PriorityBadge, PhaseBadge } from "./StatusBadge";
import "../../styles/home-page.css";
import "../../styles/select-process-modal.css";

export function ProcessCard({
  process,
  onClick,
  selected = false,
  actions = null,
  showChevron = true,
  className = "",
  compact = false,
}) {
  if (!process) return null;

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
      className={`process-card ${selected ? "is-selected" : ""} ${compact ? "process-card--compact" : ""} ${className}`.trim()}
    >
      {/* Card body */}
      <div className="process-card-body">
        {/* CNJ + Tribunal */}
        <div className="process-card-topline">
          <p className="process-card-cnj">{process.cnj}</p>
          {process.tribunal && (
            <span className="process-card-tribunal">{process.tribunal}</span>
          )}
        </div>

        {/* Client name */}
        <p className="process-card-name">{process.clientName}</p>

        {/* Hearing date */}
        {process.hearingDate && process.hearingDate !== "—" ? (
          <div className="process-card-hearing">
            <Calendar size={12} className="process-card-hearing-icon" />
            <span className="process-card-hearing-text">
              Audiência:{" "}
              <strong className="process-card-hearing-date">
                {process.hearingDate}
              </strong>
            </span>
          </div>
        ) : (
          !compact && <div className="process-card-hearing-spacer" />
        )}

        {/* Badges */}
        <div className="process-card-badges">
          <StatusBadge status={process.status} />
          <PriorityBadge priority={process.priority} />
          <PhaseBadge phase={process.phase} />
        </div>
      </div>

      {/* Card footer / Selection Badge / Chevron */}
      {(selected || (showChevron && !actions) || actions) && (
        <div className="process-card-footer">
          {selected && (
            <div className="process-card-selected-badge" title="Selecionado">
              <Check size={16} />
            </div>
          )}
          {!selected && showChevron && !actions && (
            <ChevronRight size={15} className="process-card-chevron" />
          )}
          {actions && <div className="process-card-actions">{actions}</div>}
        </div>
      )}
    </div>
  );
}
