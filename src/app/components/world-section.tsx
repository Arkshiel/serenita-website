import { motion } from "motion/react";
import { useRef, useState, useEffect, useCallback } from "react";
import { OrnateDivider } from "./ornate-divider";

const nations = [
  {
    name: "Ignareth",
    subtitle: "The Ember Throne",
    element: "Ignis",
    elementColor: "#f97316",
    description: "A volcanic kingdom carved into the mountainside, where rivers of magma light the forge-cities of an ancient warrior civilization. Its people bow to no sovereign but the flame itself.",
    image: "/images/ignareth.jpg",
    sovereign: "The Eternal Pyre",
    terrain: "Volcanic Highlands",
  },
  {
    name: "Velmoor",
    subtitle: "The Sunken Court",
    element: "Spectra",
    elementColor: "#4ade80",
    description: "A kingdom that exists between the living and the dead, built on the ruins of a civilization consumed by the void. Its queen rules from a hollow throne, and her word carries the weight of eternity.",
    image: "/images/velmoor.jpg",
    sovereign: "The Hollow Queen",
    terrain: "Ashen Wetlands",
  },
  {
    name: "Ardos",
    subtitle: "The Wandering Reaches",
    element: "Aero",
    elementColor: "#7ecac3",
    description: "A vast open expanse of sky-scraping cliffs and howling passes, where tengu clans and nomadic wind-riders have never bent a knee to walls or kings. Freedom here is not granted — it is taken.",
    image: "/images/ardos.jpg",
    sovereign: "The Gale Council",
    terrain: "Skyrift Cliffs",
  },
  {
    name: "Thalvera",
    subtitle: "The Tideborn City",
    element: "Marea",
    elementColor: "#38bdf8",
    description: "Built on a network of floating platforms above an endless inland sea, Thalvera is a merchant empire of immense wealth and hidden ruthlessness. Its canals run as deep as its secrets.",
    image: "/images/thalvera.jpg",
    sovereign: "The Tidal Senate",
    terrain: "Inland Archipelago",
  },
  {
    name: "Kraelvoss",
    subtitle: "The Storm Cradle",
    element: "Fulmen",
    elementColor: "#c084fc",
    description: "A militaristic city-state perpetually wreathed in storm clouds, where lightning-callers serve as both priests and generals. The thunder never stops, and neither does the march of its armies.",
    image: "/images/kraelvoss.jpg",
    sovereign: "The Storm Marshal",
    terrain: "Stormpeaked Plateaus",
  },
  {
    name: "Glacivorn",
    subtitle: "The Frozen Silence",
    element: "Glacis",
    elementColor: "#93c5fd",
    description: "A reclusive nation buried beneath perpetual winter, its people carving elegant civilizations into glaciers and frozen tundra. Outsiders who survive the cold find a culture of terrifying beauty.",
    image: "/images/glacivorn.jpg",
    sovereign: "The Frost Conclave",
    terrain: "Glacial Tundra",
  },
  {
    name: "Durenmaal",
    subtitle: "The Stoneheart Basin",
    element: "Terrus",
    elementColor: "#fbbf24",
    description: "An ancient dwarven-descended civilization nestled in canyon valleys, where every building is hewn from living rock. Their memory stretches back to the first age of the world.",
    image: "/images/durenmaal.jpg",
    sovereign: "The Elder Stones",
    terrain: "Canyon Basins",
  },
  {
    name: "Selvaran",
    subtitle: "The Verdant Deep",
    element: "Virael",
    elementColor: "#86efac",
    description: "A vast primordial rainforest nation governed by druid-kings and ancient grove spirits. The canopy stretches so high that some villages have never seen the ground, built entirely in the treetops.",
    image: "/images/selvaran.jpg",
    sovereign: "The Grove Synod",
    terrain: "Ancient Rainforest",
  },
];

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
  [key: string]: number | boolean | undefined;
}

function createSweepParticles(element: string, w: number, h: number): Particle[] {
  switch (element) {
    case "Ignis":
      return Array.from({ length: 55 }, (_, i) => ({
        x: -30 - Math.random() * 60,
        y: h * 0.3 + Math.random() * h * 0.8,
        vx: 6 + Math.random() * 8,
        vy: -(1 + Math.random() * 3),
        life: 1, maxLife: 1,
        size: 14 + Math.random() * 20,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.12 + Math.random() * 0.1,
        delay: i * 1.5,
        active: false,
      }));

    case "Spectra":
      return Array.from({ length: 30 }, (_, i) => ({
        x: Math.random() * w,
        y: h + 20 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(1.5 + Math.random() * 2.5),
        life: 1, maxLife: 1,
        size: 6 + Math.random() * 10,
        delay: i * 2.5,
        active: false,
        pulse: 0,
      }));

    case "Aero":
      return Array.from({ length: 8 }, (_, i) => ({
        x: -w * 0.3,
        y: h * 0.1 + (i / 8) * h * 0.85,
        vx: 14 + Math.random() * 10,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1, maxLife: 1,
        size: 3 + Math.random() * 3,
        length: w * (0.6 + Math.random() * 0.8),
        delay: i * 4 + Math.random() * 8,
        active: false,
        alpha: 0.6 + Math.random() * 0.4,
      }));

    case "Marea":
      return Array.from({ length: 40 }, (_, i) => ({
        x: (i / 40) * w * 1.1 - w * 0.05,
        y: h + 10 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -(3 + Math.random() * 4),
        life: 1, maxLife: 1,
        size: 8 + Math.random() * 14,
        phase: (i / 40) * Math.PI * 2,
        delay: (i / 40) * 8,
        active: false,
      }));

    case "Fulmen":
      return Array.from({ length: 5 }, (_, i) => ({
        x: w * (0.1 + i * 0.2) + (Math.random() - 0.5) * 40,
        y: 0,
        vx: 0, vy: 0,
        life: 1, maxLife: 1,
        size: 2,
        delay: i * 10,
        active: false,
        alpha: 1,
        segs: 10 + Math.floor(Math.random() * 8),
        tx: w * (0.1 + i * 0.2) + (Math.random() - 0.5) * 60,
        ty: h,
        flashTimer: 0,
      }));

    case "Glacis":
      return Array.from({ length: 24 }, (_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const speed = 3 + Math.random() * 5;
        return {
          x: w * 0.5, y: h * 0.45,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1, maxLife: 1,
          size: 4 + Math.random() * 8,
          spin: Math.random() * Math.PI * 2,
          spinSpeed: (Math.random() - 0.5) * 0.15,
          delay: Math.random() * 5,
          active: false,
          gravity: 0.06,
        };
      });

    case "Terrus":
      return Array.from({ length: 18 }, () => ({
        x: w * 0.15 + Math.random() * w * 0.7,
        y: h + 10,
        vx: (Math.random() - 0.5) * 5,
        vy: -(6 + Math.random() * 6),
        life: 1, maxLife: 1,
        size: 5 + Math.random() * 10,
        gravity: 0.18 + Math.random() * 0.08,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.12,
        delay: Math.random() * 12,
        active: false,
      }));

    case "Virael":
      return Array.from({ length: 35 }, (_, i) => ({
        x: -20 - Math.random() * w * 0.5,
        y: -20 - Math.random() * h * 0.5,
        vx: 4 + Math.random() * 5,
        vy: 3 + Math.random() * 4,
        life: 1, maxLife: 1,
        size: 5 + Math.random() * 8,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.1,
        sway: Math.random() * Math.PI * 2,
        delay: i * 2 + Math.random() * 10,
        active: false,
      }));

    default: return [];
  }
}

function tickSweepParticle(p: Particle, element: string, w: number, h: number): boolean {
  if ((p.delay as number) > 0) { (p.delay as number) -= 1; return true; }
  if (!(p.active as boolean)) p.active = true;

  switch (element) {
    case "Ignis":
      p.wobble = (p.wobble as number) + (p.wobbleSpeed as number);
      p.x += p.vx + Math.sin(p.wobble as number) * 1.2;
      p.y += p.vy;
      p.life -= 0.018;
      p.size *= 0.992;
      return p.life > 0 && p.x < w + 60;

    case "Spectra":
      p.x += p.vx;
      p.y += p.vy;
      p.pulse = (p.pulse as number) + 0.15;
      p.life -= 0.014;
      return p.life > 0 && p.y > -40;

    case "Aero":
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.025;
      return p.life > 0 && p.x < w + 200;

    case "Marea":
      p.x += p.vx;
      p.y += p.vy;
      p.phase = (p.phase as number) + 0.08;
      p.vy *= 0.97;
      p.life -= 0.016;
      p.size *= 0.995;
      return p.life > 0 && p.y > -30;

    case "Fulmen":
      p.flashTimer = (p.flashTimer as number) + 1;
      if ((p.flashTimer as number) > 3) p.life -= 0.08;
      return p.life > 0;

    case "Glacis":
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity as number;
      p.spin = (p.spin as number) + (p.spinSpeed as number);
      p.life -= 0.022;
      return p.life > 0;

    case "Terrus":
      p.x += p.vx;
      p.vy += p.gravity as number;
      p.y += p.vy;
      p.spin = (p.spin as number) + (p.spinSpeed as number);
      p.life -= 0.018;
      return p.life > 0 && p.y < h + 40;

    case "Virael":
      p.sway = (p.sway as number) + 0.04;
      p.x += p.vx + Math.sin(p.sway as number) * 0.6;
      p.y += p.vy;
      p.spin = (p.spin as number) + (p.spinSpeed as number);
      p.life -= 0.014;
      return p.life > 0 && p.x < w + 40 && p.y < h + 40;

    default: return false;
  }
}

function renderSweepParticle(ctx: CanvasRenderingContext2D, p: Particle, element: string, color: string) {
  if (!(p.active as boolean) || p.life <= 0) return;
  const { x, y, life, size } = p;
  ctx.save();

  switch (element) {
    case "Ignis": {
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 2.2);
      g.addColorStop(0,   `rgba(255,240,120,${life * 0.95})`);
      g.addColorStop(0.3, `rgba(255,130,20,${life * 0.8})`);
      g.addColorStop(0.7, `rgba(220,50,0,${life * 0.5})`);
      g.addColorStop(1,   `rgba(80,0,0,0)`);
      ctx.fillStyle = g;
      ctx.shadowColor = "#ff6010";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "Spectra": {
      const pulse = Math.sin(p.pulse as number) * 0.3 + 0.7;
      ctx.globalAlpha = life * pulse * 0.85;
      ctx.shadowColor = color;
      ctx.shadowBlur = 24;
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      g.addColorStop(0, `rgba(200,255,200,${life})`);
      g.addColorStop(0.5, color + "cc");
      g.addColorStop(1, color + "00");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = life * pulse;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "Aero": {
      const len = p.length as number;
      ctx.globalAlpha = life * (p.alpha as number);
      ctx.lineWidth = p.size;
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      const g2 = ctx.createLinearGradient(x - len * 0.1, y, x + len * 0.6, y);
      g2.addColorStop(0, "transparent");
      g2.addColorStop(0.2, color);
      g2.addColorStop(0.8, color);
      g2.addColorStop(1, "transparent");
      ctx.strokeStyle = g2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y + (p.vy as number) * 20);
      ctx.stroke();
      ctx.globalAlpha = life * (p.alpha as number) * 0.4;
      ctx.lineWidth = p.size * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, y - p.size * 1.5);
      ctx.lineTo(x + len * 0.8, y + (p.vy as number) * 15 - p.size);
      ctx.stroke();
      break;
    }

    case "Marea": {
      const sway = Math.sin(p.phase as number) * 4;
      const g = ctx.createRadialGradient(x, y + sway, 0, x, y + sway, size * 2);
      g.addColorStop(0,   `rgba(180,240,255,${life * 0.9})`);
      g.addColorStop(0.4, `rgba(56,189,248,${life * 0.7})`);
      g.addColorStop(1,   `rgba(10,100,200,0)`);
      ctx.fillStyle = g;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y + sway, size * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case "Fulmen": {
      if ((p.flashTimer as number) < 2) break;
      ctx.globalAlpha = life * 0.9;
      ctx.shadowColor = color;
      ctx.shadowBlur = 30;
      ctx.strokeStyle = `rgba(220,180,255,${life * 0.4})`;
      ctx.lineWidth = 6;
      drawJaggedBolt(ctx, x, y, p.tx as number, p.ty as number, p.segs as number);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      drawJaggedBolt(ctx, x, y, p.tx as number, p.ty as number, p.segs as number);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.8;
      drawJaggedBolt(ctx, x, y, p.tx as number, p.ty as number, p.segs as number);
      break;
    }

    case "Glacis": {
      ctx.globalAlpha = life * 0.9;
      ctx.translate(x, y);
      ctx.rotate(p.spin as number);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      const hs = size;
      for (let arm = 0; arm < 6; arm++) {
        ctx.save();
        ctx.rotate((arm * Math.PI) / 3);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -hs * 2.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -hs); ctx.lineTo(-hs * 0.6, -hs * 1.7);
        ctx.moveTo(0, -hs); ctx.lineTo(hs * 0.6, -hs * 1.7); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = `rgba(200,230,255,${life * 0.8})`;
      ctx.beginPath(); ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2); ctx.fill();
      break;
    }

    case "Terrus": {
      ctx.globalAlpha = life * 0.88;
      ctx.translate(x, y);
      ctx.rotate(p.spin as number);
      ctx.fillStyle = `rgb(${180 + Math.floor(life * 40)}, ${130 + Math.floor(life * 30)}, 50)`;
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 10;
      const s = size;
      ctx.beginPath();
      ctx.moveTo(0, -s); ctx.lineTo(s * 0.7, 0); ctx.lineTo(s * 0.4, s);
      ctx.lineTo(-s * 0.4, s); ctx.lineTo(-s * 0.7, 0); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(255,220,100,${life * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.3); ctx.lineTo(s * 0.3, s * 0.5); ctx.stroke();
      break;
    }

    case "Virael": {
      ctx.globalAlpha = life * 0.85;
      ctx.translate(x, y);
      ctx.rotate(p.spin as number);
      const lh = size;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -lh);
      ctx.bezierCurveTo(lh * 0.9, -lh * 0.5, lh * 0.9, lh * 0.5, 0, lh);
      ctx.bezierCurveTo(-lh * 0.9, lh * 0.5, -lh * 0.9, -lh * 0.5, 0, -lh);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${life * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -lh * 0.8); ctx.lineTo(0, lh * 0.8); ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

function drawJaggedBolt(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, segs: number) {
  const pts: [number, number][] = [[x0, y0]];
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    pts.push([
      x0 + (x1 - x0) * t + (Math.random() - 0.5) * 40,
      y0 + (y1 - y0) * t + (Math.random() - 0.5) * 12,
    ]);
  }
  pts.push([x1, y1]);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

// ─── ElementCanvas — only runs rAF while actively hovered ────────────────────
function ElementCanvas({ element, color, active }: { element: string; color: string; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef<{ particles: Particle[]; frame: number; running: boolean }>({
    particles: [], frame: 0, running: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return () => ro.disconnect();
  }, []);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = stateRef.current;
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    st.frame++;

    st.particles = st.particles.filter((p) => {
      const alive = tickSweepParticle(p, element, w, h);
      if (alive) renderSweepParticle(ctx, p, element, color);
      return alive;
    });

    // Only keep looping while running AND particles remain
    if (st.running && st.particles.length > 0) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      // All done — clear canvas cleanly
      ctx.clearRect(0, 0, w, h);
    }
  }, [element, color]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;

    if (active) {
      // Start fresh sweep
      cancelAnimationFrame(rafRef.current);
      st.particles = createSweepParticles(element, canvas.width, canvas.height);
      st.frame = 0;
      st.running = true;
      rafRef.current = requestAnimationFrame(loop);
    } else {
      // Stop IMMEDIATELY — no lingering particles
      st.running = false;
      st.particles = [];
      cancelAnimationFrame(rafRef.current);
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [active, element, loop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stateRef.current.running = false;
      stateRef.current.particles = [];
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 4,
      }}
    />
  );
}

// ─── NationCard ───────────────────────────────────────────────────────────────
function NationCard({ nation, isVisible }: { nation: typeof nations[0]; isVisible: boolean }) {
  const [hovered, setHovered] = useState(false);

  // Cancel hover if card scrolls out of visible window
  useEffect(() => {
    if (!isVisible) setHovered(false);
  }, [isVisible]);

  return (
    <div
      onMouseEnter={() => isVisible && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: isVisible ? 1 : 0.28,
        transform: isVisible
          ? hovered ? "translateY(-10px) scale(1.02)" : "scale(1)"
          : "scale(0.96)",
        transition: "opacity 0.5s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* IMAGE */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "16/9" }}>
        <img
          src={nation.image}
          alt={nation.name}
          draggable={false}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: `brightness(${hovered ? 0.7 : 0.52}) saturate(${hovered ? 1.1 : 0.8})`,
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease",
          }}
        />

        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, #06080f 0%, rgba(6,8,15,0.25) 55%, transparent 100%),
                       linear-gradient(135deg, ${nation.elementColor}1a 0%, transparent 55%)`,
        }} />

        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 60%, ${nation.elementColor}28 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.5s ease",
          zIndex: 2,
        }} />

        <div style={{
          position: "absolute", inset: 0,
          boxShadow: hovered ? `inset 0 0 40px ${nation.elementColor}44` : "none",
          transition: "box-shadow 0.5s ease",
          zIndex: 3,
        }} />

        {/* Particle canvas — only active on hover */}
        <ElementCanvas element={nation.element} color={nation.elementColor} active={hovered && isVisible} />

        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 5,
          padding: "5px 12px",
          background: hovered ? "rgba(6,8,15,0.88)" : "rgba(6,8,15,0.72)",
          border: `1px solid ${nation.elementColor}${hovered ? "bb" : "44"}`,
          backdropFilter: "blur(6px)",
          transition: "border-color 0.3s ease, background 0.3s ease",
          boxShadow: hovered ? `0 0 12px ${nation.elementColor}44` : "none",
        }}>
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: "0.58rem",
            letterSpacing: "0.18em", color: nation.elementColor,
            textTransform: "uppercase",
            textShadow: hovered ? `0 0 8px ${nation.elementColor}` : "none",
          }}>
            {nation.element}
          </span>
        </div>

        <div style={{
          position: "absolute", bottom: 12, left: 16, zIndex: 5,
          height: 2,
          width: hovered ? 72 : 20,
          background: `linear-gradient(to right, ${nation.elementColor}, ${nation.elementColor}66)`,
          transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: hovered ? `0 0 10px ${nation.elementColor}` : "none",
        }} />
      </div>

      {/* INFO PANEL */}
      <div style={{
        padding: "22px",
        background: hovered ? "rgba(18,23,44,0.98)" : "rgba(13,17,32,0.92)",
        borderLeft: `1px solid ${nation.elementColor}${hovered ? "77" : "28"}`,
        borderRight: `1px solid rgba(200,169,110,0.06)`,
        borderBottom: `1px solid ${nation.elementColor}${hovered ? "44" : "0a"}`,
        transition: "background 0.4s ease, border-color 0.4s ease",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: hovered ? "110%" : "-20%",
          width: "30%", height: "100%",
          background: `linear-gradient(to right, transparent, ${nation.elementColor}0a, transparent)`,
          transition: "left 0.7s ease",
          pointerEvents: "none",
        }} />

        <p style={{
          fontFamily: "'Cinzel', serif", fontSize: "0.58rem",
          letterSpacing: "0.2em", color: nation.elementColor,
          textTransform: "uppercase", marginBottom: 5,
          textShadow: hovered ? `0 0 10px ${nation.elementColor}88` : "none",
          transition: "text-shadow 0.3s ease",
        }}>
          {nation.subtitle}
        </p>
        <h3 style={{
          fontFamily: "'Cinzel', serif",
          color: hovered ? "#fff" : "#e8d9b5",
          fontSize: "1.22rem", fontWeight: 700, marginBottom: 10,
          transition: "color 0.3s ease",
          letterSpacing: "0.04em",
        }}>
          {nation.name}
        </h3>
        <p style={{
          fontFamily: "'Crimson Pro', serif",
          color: hovered ? "rgba(232,217,181,0.82)" : "rgba(232,217,181,0.55)",
          fontSize: "0.93rem", lineHeight: 1.75, marginBottom: 16,
          transition: "color 0.3s ease",
        }}>
          {nation.description}
        </p>

        <div style={{
          display: "flex", justifyContent: "space-between",
          paddingTop: 12,
          borderTop: `1px solid rgba(200,169,110,${hovered ? "0.18" : "0.08"})`,
          transition: "border-color 0.3s ease",
        }}>
          <div>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "0.15em", color: "rgba(232,217,181,0.28)", textTransform: "uppercase", marginBottom: 3 }}>Sovereign</p>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.88rem", color: nation.elementColor, textShadow: hovered ? `0 0 8px ${nation.elementColor}66` : "none", transition: "text-shadow 0.3s ease" }}>
              {nation.sovereign}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "0.15em", color: "rgba(232,217,181,0.28)", textTransform: "uppercase", marginBottom: 3 }}>Terrain</p>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.88rem", color: "rgba(232,217,181,0.6)" }}>
              {nation.terrain}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WorldSection ─────────────────────────────────────────────────────────────
const VISIBLE = 3;
const GAP = 20;

export function WorldSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const canPrev = index > 0;
  const canNext = index + VISIBLE < nations.length;
  const go = (dir: 1 | -1) => {
    if (dir === 1 && !canNext) return;
    if (dir === -1 && !canPrev) return;
    setIndex((i) => i + dir);
  };

  const cardWidthPct = 100 / nations.length;
  const offsetPct = -(index * cardWidthPct);

  return (
    <section ref={ref} id="world" className="relative py-28" style={{ background: "#06080f", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>The Lands of Serenita</p>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#e8d9b5", fontWeight: 700 }}>Eight Nations, One World</h2>
          <div className="mt-4 max-w-xs mx-auto"><OrnateDivider /></div>
          <p className="mt-6 max-w-xl mx-auto" style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.6)", fontSize: "1.1rem", lineHeight: 1.8 }}>
            Each nation breathes the essence of its element — forged by ancient sovereigns whose power still echoes through every stone, wave, and gust of wind.
          </p>
        </motion.div>

        <div className="relative">
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 70, background: "linear-gradient(to right, #06080f, transparent)", zIndex: 6, pointerEvents: "none", opacity: canPrev ? 1 : 0, transition: "opacity 0.4s ease" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 70, background: "linear-gradient(to left, #06080f, transparent)", zIndex: 6, pointerEvents: "none", opacity: canNext ? 1 : 0, transition: "opacity 0.4s ease" }} />

          <div style={{ overflow: "hidden" }}>
            <div style={{
              display: "flex", gap: GAP,
              width: `calc(${(nations.length / VISIBLE) * 100}% + ${Math.floor(nations.length / VISIBLE - 1) * GAP}px)`,
              transform: `translateX(calc(${offsetPct}% - ${index * GAP * (1 / VISIBLE) * VISIBLE}px))`,
              transition: "transform 0.65s cubic-bezier(0.4,0,0.2,1)",
              willChange: "transform",
            }}>
              {nations.map((nation, i) => (
                <div key={nation.name} style={{ flex: `0 0 calc(${100 / nations.length}% - ${GAP * ((nations.length - 1) / nations.length)}px)` }}>
                  <NationCard nation={nation} isVisible={i >= index && i < index + VISIBLE} />
                </div>
              ))}
            </div>
          </div>

          {(["prev", "next"] as const).map((dir) => {
            const isPrev = dir === "prev";
            const enabled = isPrev ? canPrev : canNext;
            return (
              <button key={dir} onClick={() => go(isPrev ? -1 : 1)} disabled={!enabled}
                style={{
                  position: "absolute", [isPrev ? "left" : "right"]: -52, top: "38%",
                  transform: "translateY(-50%)", zIndex: 10,
                  width: 42, height: 42,
                  background: enabled ? "rgba(13,17,32,0.95)" : "rgba(13,17,32,0.25)",
                  border: `1px solid ${enabled ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.07)"}`,
                  color: enabled ? "#d4af37" : "rgba(212,175,55,0.12)",
                  cursor: enabled ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", lineHeight: 1,
                  transition: "all 0.25s ease", backdropFilter: "blur(8px)",
                  boxShadow: enabled ? "0 0 20px rgba(212,175,55,0.08)" : "none",
                }}>
                {isPrev ? "‹" : "›"}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {nations.map((n, i) => {
            const isVis = i >= index && i < index + VISIBLE;
            return (
              <motion.div key={n.name}
                animate={{ width: isVis ? 24 : 8, background: isVis ? n.elementColor : "rgba(200,169,110,0.2)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                style={{ height: 6, borderRadius: 3 }}
              />
            );
          })}
        </div>

        <p style={{ textAlign: "center", marginTop: 8, fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(212,175,55,0.35)", textTransform: "uppercase" }}>
          {index + 1}–{Math.min(index + VISIBLE, nations.length)} of {nations.length}
        </p>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px"
          style={{ border: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.05)" }}>
          {[{ value: "8", label: "Nations" }, { value: "0", label: "Players" }, { value: "∞", label: "Sessions" }, { value: "1", label: "True World" }].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center py-8 px-4" style={{ background: "rgba(6,8,15,0.9)" }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: "2.5rem", fontWeight: 700, background: "linear-gradient(180deg, #e8d9b5 0%, #c8a96e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {stat.value}
              </span>
              <span className="text-xs tracking-widest uppercase mt-1" style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.4)", letterSpacing: "0.15em" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}