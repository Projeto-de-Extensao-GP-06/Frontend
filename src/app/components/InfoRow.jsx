export function InfoRow({
  label,
  value,
  mono = false,
  icon,
  variant = "client",
  className = "",
}) {
  if (variant === "proc") {
    return (
      <div className={className}>
        <p className="proc-info-row__label">{label}</p>
        <p className={`proc-info-row__value ${mono ? "proc-info-row__value--mono" : ""}`.trim()}>
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className={`client-detail-info-row ${className}`.trim()}>
      {icon && <span className="client-detail-info-icon">{icon}</span>}
      <div className="client-detail-info-body">
        <p className="client-detail-info-label">{label}</p>
        <p className={`client-detail-info-value ${mono ? "client-detail-info-value--mono" : ""}`.trim()}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default InfoRow;
