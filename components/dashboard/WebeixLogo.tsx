export default function WebeixLogo() {
  return (
    <a href="/dashboard" className="dash-logo" aria-label="Webeix home">
      <span className="dash-logo__mark" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 22L8 6L12 18L16 6L20 22" stroke="url(#webeix-w)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="webeix-w" x1="4" y1="6" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="0.5" stopColor="#F37335" />
              <stop offset="1" stopColor="#2DD4BF" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="dash-logo__text">WEBEIX</span>
    </a>
  );
}
