export function Footer() {
  return (
    <footer
      className="py-8 px-6 text-center"
      style={{
        borderTop: "1px solid rgba(212,175,55,0.1)",
        background: "#06080f",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L19 11H29L21 17L24 26L16 20L8 26L11 17L3 11H13L16 2Z" fill="url(#footerGrad)" />
            <defs>
              <linearGradient id="footerGrad" x1="3" y1="2" x2="29" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d4af37" />
                <stop offset="1" stopColor="#c8a96e" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.4)", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Serenita
          </span>
        </div>
        <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.3)", fontSize: "0.85rem" }}>
          An original DnD campaign · By Solarae
        </p>
        <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(212,175,55,0.25)", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
          © 2026 — All rights belong to their respective owners
        </p>
      </div>
    </footer>
  );
}
