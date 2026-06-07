import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
}

const COLORS = [
  "rgba(212, 175, 55, ",
  "rgba(200, 169, 110, ",
  "rgba(147, 197, 253, ",
  "rgba(196, 181, 253, ",
  "rgba(134, 239, 172, ",
  "rgba(253, 186, 116, ",
];

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const count = 80;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.1,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random(),
      opacityDir: Math.random() > 0.5 ? 1 : -1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        p.opacity += p.opacityDir * 0.003;
        if (p.opacity >= 1) p.opacityDir = -1;
        if (p.opacity <= 0.05) p.opacityDir = 1;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        const pulseOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
        glow.addColorStop(0, `${p.color}${pulseOpacity})`);
        glow.addColorStop(1, `${p.color}0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.min(pulseOpacity * 1.5, 1)})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
