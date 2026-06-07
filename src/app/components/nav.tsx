import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const scrollLinks = ["World", "Characters", "Elements", "Journey"];
const pageLinks = [
  { label: "World Map", path: "/map" },
  { label: "Adventurers", path: "/adventurers" },
];

// ─── Background music hook ───────────────────────────────────────────────────
function useBackgroundMusic(src: string, autoPlay: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [src]);

  useEffect(() => {
    if (!autoPlay || startedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    startedRef.current = true;

    audio.play().then(() => {
      setPlaying(true);
      let vol = 0;
      const fade = setInterval(() => {
        vol = Math.min(vol + 0.014, 0.35);
        audio.volume = vol;
        if (vol >= 0.35) clearInterval(fade);
      }, 100);
    }).catch((err) => {
      console.warn("Audio play failed:", err);
    });
  }, [autoPlay]);

  const toggle = () => {
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    setMuted(next);
  };

  return { muted, playing, toggle };
}

// ─── Component ────────────────────────────────────────────────────────────────
interface NavProps {
  autoPlay?: boolean;
}

export function Nav({ autoPlay = false }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { muted, playing, toggle } = useBackgroundMusic("/images/background.mp3", autoPlay);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 60));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollTo = (id: string) => {
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const goTo = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: scrolled
            ? "linear-gradient(to bottom, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.0) 100%)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(212,175,55,0.15)" : "none",
          transition: "all 0.4s ease",
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L19 11H29L21 17L24 26L16 20L8 26L11 17L3 11H13L16 2Z" fill="url(#logoGrad)" />
            <defs>
              <linearGradient id="logoGrad" x1="3" y1="2" x2="29" y2="26" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d4af37" />
                <stop offset="1" stopColor="#c8a96e" />
              </linearGradient>
            </defs>
          </svg>
          <span
            className="text-lg tracking-widest uppercase"
            style={{ fontFamily: "'Cinzel', serif", color: "#e8d9b5", letterSpacing: "0.15em" }}
          >
            Serenita
          </span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {/* Home scroll links */}
          {scrollLinks.map((link) => (
            <motion.button
              key={link}
              onClick={() => scrollTo(link)}
              className="relative text-sm tracking-widest uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                color: "rgba(232,217,181,0.7)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
              }}
              whileHover={{ color: "#d4af37" }}
              transition={{ duration: 0.2 }}
            >
              {link}
              <motion.div
                className="absolute -bottom-1 left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(to right, transparent, #d4af37, transparent)",
                  scaleX: 0,
                }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          ))}

          {/* Separator */}
          <div style={{ width: 1, height: 16, background: "rgba(212,175,55,0.2)" }} />

          {/* Page links */}
          {pageLinks.map((link) => (
            <motion.button
              key={link.path}
              onClick={() => goTo(link.path)}
              className="relative text-sm tracking-widest uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                color: location.pathname === link.path ? "#d4af37" : "rgba(232,217,181,0.7)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
              }}
              whileHover={{ color: "#d4af37" }}
              transition={{ duration: 0.2 }}
            >
              {link.label}
              {/* Active underline */}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(to right, transparent, #d4af37, transparent)",
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Right side: Mute + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mute button */}
          <motion.button
            onClick={toggle}
            title={muted ? "Unmute music" : "Mute music"}
            className="relative flex items-center justify-center w-9 h-9"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(200,169,110,0.05))",
              border: "1px solid rgba(212,175,55,0.25)",
              color: muted ? "rgba(212,175,55,0.4)" : "#d4af37",
              cursor: "pointer",
              borderRadius: "2px",
              transition: "color 0.3s, border-color 0.3s",
            }}
            whileHover={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(200,169,110,0.12))",
              borderColor: "rgba(212,175,55,0.6)",
              scale: 1.05,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={muted ? "muted" : "playing"}
                initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex" }}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </motion.span>
            </AnimatePresence>

            {playing && !muted && (
              <motion.span
                className="absolute inset-0"
                style={{
                  border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
                animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.25, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.button>

          {/* Begin Journey CTA */}
          <motion.button
            onClick={() => scrollTo("Journey")}
            className="px-6 py-2 text-sm tracking-widest uppercase"
            style={{
              fontFamily: "'Cinzel', serif",
              background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(200,169,110,0.1))",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#d4af37",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
            whileHover={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(200,169,110,0.2))",
              borderColor: "rgba(212,175,55,0.8)",
              scale: 1.02,
            }}
            whileTap={{ scale: 0.98 }}
          >
            Begin Journey
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer" }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden px-6 py-4 flex flex-col gap-4"
            style={{
              background: "rgba(6,8,15,0.97)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(212,175,55,0.2)",
            }}
          >
            {scrollLinks.map((link) => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                className="py-2 text-left tracking-widest uppercase text-sm"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "rgba(232,217,181,0.8)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {link}
              </button>
            ))}

            <div style={{ height: 1, background: "rgba(212,175,55,0.15)" }} />

            {pageLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => goTo(link.path)}
                className="py-2 text-left tracking-widest uppercase text-sm"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: location.pathname === link.path ? "#d4af37" : "rgba(232,217,181,0.8)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {link.label}
              </button>
            ))}

            <div style={{ height: 1, background: "rgba(212,175,55,0.15)" }} />

            <button
              onClick={toggle}
              className="py-2 text-left tracking-widest uppercase text-sm flex items-center gap-2"
              style={{
                fontFamily: "'Cinzel', serif",
                color: muted ? "rgba(212,175,55,0.4)" : "#d4af37",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "Unmute Music" : "Mute Music"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}