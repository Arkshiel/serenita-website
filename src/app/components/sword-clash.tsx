import { useEffect } from "react";

const SwordSVG = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" style={{ transform: "rotate(180deg)" }}>
    <rect x="38" y="5" width="4" height="52" rx="2" fill="#d4cfc4" />
    <polygon points="40,2 36,14 44,14" fill="#b8a96a" />
    <rect x="26" y="54" width="28" height="5" rx="2.5" fill="#8b7355" />
    <rect x="37" y="59" width="6" height="17" rx="3" fill="#5c4a32" />
    <circle cx="40" cy="78" r="4" fill="#8b7355" />
    <rect x="40" y="8" width="1.5" height="42" rx="0.75" fill="white" opacity="0.3" />
  </svg>
);

export function SwordClash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes slideFromTopLeft {
        from { transform: translate(-300px, -300px) rotate(-45deg); }
        to   { transform: translate(20px, 20px) rotate(-45deg); }
        }
        @keyframes slideFromTopRight {
        from { transform: translate(300px, -300px) rotate(45deg) scaleX(-1); }
        to   { transform: translate(-20px, 20px) rotate(45deg) scaleX(-1); }
        }
        @keyframes bounceTopLeft {
        0%   { transform: translate(20px, 20px) rotate(-45deg); }
        100% { transform: translate(-10px, -10px) rotate(-45deg); }
        }
        @keyframes bounceTopRight {
        0%   { transform: translate(-20px, 20px) rotate(45deg) scaleX(-1); }
        100% { transform: translate(10px, -10px) rotate(45deg) scaleX(-1); }
        }
        @keyframes flashIn {
          0%   { opacity: 0; }
          30%  { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes textIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.6); }
          to   { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes overlayOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes sparkFly {
          from { transform: translate(0,0); opacity: 1; }
          to   { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        .clash-wrap {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          animation: overlayOut 0.4s ease 1.4s forwards;
        }
        .clash-sword-left {
          position: absolute;
          filter: drop-shadow(0 0 12px rgba(255,200,50,0.8));
          animation:
            slideFromTopLeft 0.35s cubic-bezier(0.2,0,0.4,1) forwards,
            bounceTopLeft 0.18s ease-out 0.43s forwards;
        }
        .clash-sword-right {
          position: absolute;
          filter: drop-shadow(0 0 12px rgba(255,200,50,0.8));
          animation:
            slideFromTopRight 0.35s cubic-bezier(0.2,0,0.4,1) forwards,
            bounceTopRight 0.18s ease-out 0.43s forwards;
        }
        .clash-flash {
          position: fixed; inset: 0;
          background: rgba(255,255,220,0.55);
          animation: flashIn 0.35s ease-out 0.35s forwards;
          opacity: 0;
          pointer-events: none;
        }
        .clash-text {
          position: absolute;
          bottom: 28%;
          left: 50%;
          transform: translateX(-50%);
          font-family: serif;
          font-size: 48px;
          font-weight: 700;
          color: #c4a96b;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-shadow: 0 0 30px rgba(196,169,107,0.6);
          white-space: nowrap;
          opacity: 0;
          animation: textIn 0.25s cubic-bezier(0.34,1.56,0.64,1) 0.56s forwards;
        }
        .clash-spark {
          position: absolute;
          border-radius: 50%;
          animation: sparkFly var(--dur) ease-out 0.36s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="clash-wrap">
        <div className="clash-flash" />
        <div className="clash-sword-left"><SwordSVG /></div>
        <div className="clash-sword-right"><SwordSVG /></div>
        <div className="clash-text">Battle Begins</div>

        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * 360;
          const dist = 40 + Math.random() * 80;
          const dx = Math.cos((angle * Math.PI) / 180) * dist;
          const dy = Math.sin((angle * Math.PI) / 180) * dist;
          const size = 3 + Math.random() * 5;
          const colors = ["#fcd34d", "#fbbf24", "#f97316", "#fff", "#fde68a"];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const dur = (0.3 + Math.random() * 0.3).toFixed(2) + "s";
          return (
            <div
              key={i}
              className="clash-spark"
              style={{
                left: "50%", top: "50%",
                marginLeft: -size / 2, marginTop: -size / 2,
                width: size, height: size,
                background: color,
                ["--dx" as string]: `${dx}px`,
                ["--dy" as string]: `${dy}px`,
                ["--dur" as string]: dur,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}