const DEFAULT_FILTER_VALUES = new Set(["", "Todos", "Todas", "todos", "todas"]);

export function FilterSelect({
  label,
  value,
  onChange,
  children,
  prefix = "filter",
  className,
  labelClassName,
  selectClassName,
}) {
  const baseClass = prefix ? `${prefix}-filter-select` : "filter-select";
  const isActive = !DEFAULT_FILTER_VALUES.has(value ?? "");
  const containerClass = className || `${baseClass}${isActive ? ` ${baseClass}--active` : ""}`;
  const labelClass = labelClassName || (prefix ? `${prefix}-filter-select-label` : "filter-select-label");
  const selectClass = selectClassName || (prefix ? `${prefix}-filter-select-input` : "filter-select-input");

  return (
    <div className={containerClass}>
      <span className={labelClass}>
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {children}
      </select>
    </div>
  );
}

export default FilterSelect;
