import "../../styles/brand-logo.css";

export function BrandLogo({ name = "Thauany Bezerra", subtitle = "Advocacia", className = "" }) {
  return (
    <div className={`brand-logo ${className}`.trim()} role="img" aria-label={`${name} ${subtitle}`}>
      <svg className="brand-logo__monogram" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g transform="translate(17 -12)">
          <text className="brand-logo__t" x="10" y="140" fontSize="165" fill="#FFFFFF">T</text>
          <text className="brand-logo__b" x="72" y="192" fontSize="150" fill="#EBAF32">B</text>
        </g>
      </svg>
      <svg className="brand-logo__divider" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <line x1="1" y1="0" x2="1" y2="100" stroke="#EBAF32" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="brand-logo__text">
        <span className="brand-logo__name">{name}</span>
        <span className="brand-logo__subtitle">
          <span className="brand-logo__rule" aria-hidden="true" />
          <span className="brand-logo__subtitle-text">{subtitle}</span>
          <span className="brand-logo__rule" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
