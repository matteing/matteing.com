export function Footer() {
  return (
    <footer className="site-footer">
      <a
        href="https://web.archive.org/web/20250124171230/https://www.tallerlaprole.online/product-page/PuertoRicanResistanceFlagSticker"
        target="_blank"
        rel="noopener noreferrer"
        title="Puerto Rican Resistance Flag"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
          <rect className="flag-bg" width="900" height="600" fill="transparent" />
          <path
            className="flag-stripes"
            stroke="var(--flag-fill)"
            strokeWidth="120"
            d="m0,60h900m0,240H0m0,240h900"
            fill="var(--flag-fill)"
          />
          <path
            className="flag-triangle"
            d="M 0,0 0,600 520,300 Z"
            fill="var(--flag-fill)"
          />
          <path
            className="flag-star"
            d="m114,382 59-183 59,183-155-113h192"
            fill="var(--flag-star)"
          />
        </svg>
      </a>
    </footer>
  );
}
