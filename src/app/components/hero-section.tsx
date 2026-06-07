import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "motion/react";
import { OrnateDivider } from "./ornate-divider";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);

  // ── Scroll transforms (motion values, no React state) ───────────────────
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
    layoutEffect: false, // avoids layout thrash on mount
  });

  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY   = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // ── Mouse parallax (motion values only, zero React renders) ─────────────
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 50, damping: 25, restDelta: 0.001 });
  const springY = useSpring(rawY, { stiffness: 50, damping: 25, restDelta: 0.001 });
  const orb1X = useTransform(springX, v => v * 1.5);
  const orb1Y = useTransform(springY, v => v * 1.5);
  const orb2X = useTransform(springX, v => v * -1);
  const orb2Y = useTransform(springY, v => v * -1);

  useEffect(() => {
    let rafId: number;
    const onMouseMove = (e: MouseEvent) => {
      // Throttle to rAF so we never queue more work than the browser can paint
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rawX.set((e.clientX / window.innerWidth  - 0.5) * 20);
        rawY.set((e.clientY / window.innerHeight - 0.5) * 10);
      });
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [rawX, rawY]);

  return (
    <section
      ref={ref}
      id="world"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background — GPU-composited layer */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY, willChange: "transform" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=1920&h=1080&fit=crop&auto=format)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.35) saturate(0.7)",
            willChange: "transform",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, rgba(70,50,120,0.4) 0%, transparent 60%), " +
              "radial-gradient(ellipse at 80% 80%, rgba(20,40,80,0.5) 0%, transparent 50%), " +
              "linear-gradient(to bottom, rgba(6,8,15,0.2) 0%, rgba(6,8,15,0.6) 70%, #06080f 100%)",
          }}
        />
      </motion.div>

      {/* Orb 1 */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ x: orb1X, y: orb1Y, top: "15%", right: "15%", willChange: "transform" }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div style={{
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(147,100,255,0.1) 50%, transparent 70%)",
          filter: "blur(30px)",
        }} />
      </motion.div>

      {/* Orb 2 */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ x: orb2X, y: orb2Y, bottom: "25%", left: "10%", willChange: "transform" }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <div style={{
          width: 150, height: 150, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(100,180,255,0.2) 0%, rgba(212,175,55,0.1) 50%, transparent 70%)",
          filter: "blur(25px)",
        }} />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl"
        style={{ y: textY, opacity, willChange: "transform, opacity" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-6 flex items-center gap-3"
        >
          <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, #d4af37)" }} />
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>
            SEE THE WONDERS
          </span>
          <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, #d4af37)" }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mb-4 leading-none"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(3rem, 8vw, 7rem)",
            fontWeight: 800,
            background: "linear-gradient(180deg, #ffffff 0%, #e8d9b5 40%, #c8a96e 70%, #8b6914 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.05em",
          }}
        >
          SERENITA
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mb-4"
        >
          <OrnateDivider />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)",
            color: "rgba(232,217,181,0.75)",
            fontWeight: 400,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "2rem",
          }}
        >
          World Is Meant For Serenity. Although Why?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="max-w-xl mb-10"
          style={{ color: "rgba(232,217,181,0.6)", fontFamily: "'Crimson Pro', serif", fontSize: "1.2rem", lineHeight: 1.8 }}
        >
          Beyond the horizon lies a world veiled in ancient secrets,
          where sleeping gods dream beneath sacred peaks and every path leads toward an untold fate.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            onClick={() => document.getElementById("characters")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              fontFamily: "'Cinzel', serif",
              padding: "14px 40px",
              background: "linear-gradient(135deg, #d4af37, #c8a96e)",
              color: "#06080f",
              border: "none",
              cursor: "pointer",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 700,
              position: "relative",
              overflow: "hidden",
            }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(212,175,55,0.5)" }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3), transparent)" }}
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
            Explore the World
          </motion.button>

          <motion.button
            onClick={() => document.getElementById("elements")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              fontFamily: "'Cinzel', serif",
              padding: "14px 40px",
              background: "transparent",
              color: "#d4af37",
              border: "1px solid rgba(212,175,55,0.5)",
              cursor: "pointer",
              fontSize: "0.85rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
            whileHover={{ borderColor: "rgba(212,175,55,0.9)", background: "rgba(212,175,55,0.08)", scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Discover Elements
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{ opacity }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cinzel', serif" }}>
          Scroll
        </span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={18} style={{ color: "rgba(212,175,55,0.6)" }} />
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #06080f)" }}
      />
    </section>
  );
}