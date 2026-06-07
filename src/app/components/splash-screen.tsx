import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  const [phase, setPhase] = useState<"idle" | "entering" | "done">("idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Particle effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; color: string; life: number; maxLife: number;
    }[] = [];

    const colors = ["#d4af37", "#c8a96e", "#e8d9b5", "#f97316", "#c084fc"];

    const spawn = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 60;
      particles.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.8 - 0.2,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 120 + Math.random() * 80,
      });
    };

    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 3 === 0) spawn();
      frame++;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const progress = p.life / p.maxLife;
        const fade = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8;
        ctx.save();
        ctx.globalAlpha = p.opacity * fade;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleEnter = () => {
    if (phase !== "idle") return;
    setPhase("entering");
    setTimeout(() => {
      setPhase("done");
      onEnter();
    }, 1800);
  };

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "entering" ? 0 : 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080f",
          overflow: "hidden",
        }}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* Radial glow behind crest */}
        <div style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Outer ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.15)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          style={{
            position: "absolute",
            width: 290,
            height: 290,
            borderRadius: "50%",
            border: "1px solid rgba(212,175,55,0.08)",
            pointerEvents: "none",
          }}
        />

        {/* Horizontal lines */}
        {[-1, 1].map((dir) => (
          <motion.div
            key={dir}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            style={{
              position: "absolute",
              top: "50%",
              [dir === -1 ? "right" : "left"]: "50%",
              marginLeft: dir === 1 ? "175px" : undefined,
              marginRight: dir === -1 ? "175px" : undefined,
              width: "20vw",
              height: "1px",
              background: `linear-gradient(to ${dir === -1 ? "left" : "right"}, rgba(212,175,55,0.4), transparent)`,
              transformOrigin: dir === -1 ? "right" : "left",
            }}
          />
        ))}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

          {/* Crest icon */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            style={{ marginBottom: 32 }}
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <path d="M36 4L42 24H64L47 37L53 58L36 45L19 58L25 37L8 24H30L36 4Z" fill="url(#splashGrad)" opacity="0.9" />
              <path d="M36 4L42 24H64L47 37L53 58L36 45L19 58L25 37L8 24H30L36 4Z" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" fill="none" />
              <defs>
                <linearGradient id="splashGrad" x1="8" y1="4" x2="64" y2="58" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e8d9b5" />
                  <stop offset="0.5" stopColor="#d4af37" />
                  <stop offset="1" stopColor="#8b6914" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 800,
              background: "linear-gradient(180deg, #ffffff 0%, #e8d9b5 35%, #d4af37 65%, #8b6914 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Serenita
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontStyle: "italic",
              color: "rgba(232,217,181,0.45)",
              fontSize: "clamp(0.85rem, 2vw, 1rem)",
              letterSpacing: "0.15em",
              marginTop: 14,
              marginBottom: 0,
            }}
          >
            A Chronicle of Nations & Consequence
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            style={{
              marginTop: 36,
              marginBottom: 36,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 60, height: "1px", background: "linear-gradient(to left, rgba(212,175,55,0.5), transparent)" }} />
            <div style={{ width: 5, height: 5, background: "#d4af37", transform: "rotate(45deg)", opacity: 0.7 }} />
            <div style={{ width: 60, height: "1px", background: "linear-gradient(to right, rgba(212,175,55,0.5), transparent)" }} />
          </motion.div>

          {/* Enter button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            onClick={handleEnter}
            disabled={phase === "entering"}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "0.75rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#d4af37",
              background: "transparent",
              border: "1px solid rgba(212,175,55,0.35)",
              padding: "16px 56px",
              cursor: phase === "entering" ? "default" : "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.3s, color 0.3s",
            }}
            whileHover={phase === "idle" ? {
              borderColor: "rgba(212,175,55,0.8)",
              color: "#e8d9b5",
              boxShadow: "0 0 30px rgba(212,175,55,0.15), inset 0 0 30px rgba(212,175,55,0.05)",
            } : {}}
            whileTap={phase === "idle" ? { scale: 0.97 } : {}}
          >
            {/* Shimmer on hover */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.12), transparent)",
                x: "-100%",
              }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />

            {/* Corner ornaments */}
            <span style={{ position: "absolute", top: 0, left: 0, width: 8, height: 8, borderTop: "1px solid rgba(212,175,55,0.6)", borderLeft: "1px solid rgba(212,175,55,0.6)" }} />
            <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderTop: "1px solid rgba(212,175,55,0.6)", borderRight: "1px solid rgba(212,175,55,0.6)" }} />
            <span style={{ position: "absolute", bottom: 0, left: 0, width: 8, height: 8, borderBottom: "1px solid rgba(212,175,55,0.6)", borderLeft: "1px solid rgba(212,175,55,0.6)" }} />
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderBottom: "1px solid rgba(212,175,55,0.6)", borderRight: "1px solid rgba(212,175,55,0.6)" }} />

            <span style={{ position: "relative", zIndex: 1 }}>
              {phase === "entering" ? "Entering..." : "Enter Serenita"}
            </span>
          </motion.button>

          {/* Hint text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontStyle: "italic",
              color: "rgba(232,217,181,0.2)",
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              marginTop: 20,
            }}
          >
            Sound on for the full experience
          </motion.p>
        </div>

        {/* Bottom vignette */}
        <div style={{
          position: "absolute",
          bottom: 0,
          inset: "auto 0 0 0",
          height: 120,
          background: "linear-gradient(to top, rgba(6,8,15,0.8), transparent)",
          pointerEvents: "none",
        }} />
      </motion.div>
    </AnimatePresence>
  );
}