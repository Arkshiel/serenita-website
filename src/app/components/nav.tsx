import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthModal } from "./auth-modal";
import { useAuth } from "./auth-provider";

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
    return () => { audio.pause(); audio.src = ""; };
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
    }).catch((err) => { console.warn("Audio play failed:", err); });
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
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { user, profile, role, loading, signOut } = useAuth();

  const { muted, playing, toggle } = useBackgroundMusic("/images/background.mp3", autoPlay);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 60));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafId); };
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    setTimeout(() => document.addEventListener("click", handler), 0);
    return () => document.removeEventListener("click", handler);
  }, [userMenuOpen]);

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
          <span className="text-lg tracking-widest uppercase"
            style={{ fontFamily: "'Cinzel', serif", color: "#e8d9b5", letterSpacing: "0.15em" }}>
            Serenita
          </span>
        </motion.div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {scrollLinks.map((link) => (
            <motion.button key={link} onClick={() => scrollTo(link)}
              className="relative text-sm tracking-widest uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.7)", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}
              whileHover={{ color: "#d4af37" }} transition={{ duration: 0.2 }}>
              {link}
              <motion.div className="absolute -bottom-1 left-0 right-0 h-px"
                style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)", scaleX: 0 }}
                whileHover={{ scaleX: 1 }} transition={{ duration: 0.3 }} />
            </motion.button>
          ))}

          <div style={{ width: 1, height: 16, background: "rgba(212,175,55,0.2)" }} />

          {pageLinks.map((link) => (
            <motion.button key={link.path} onClick={() => goTo(link.path)}
              className="relative text-sm tracking-widest uppercase"
              style={{ fontFamily: "'Cinzel', serif", color: location.pathname === link.path ? "#d4af37" : "rgba(232,217,181,0.7)", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}
              whileHover={{ color: "#d4af37" }} transition={{ duration: 0.2 }}>
              {link.label}
              {location.pathname === link.path && (
                <motion.div layoutId="activeNav" className="absolute -bottom-1 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(to right, transparent, #d4af37, transparent)" }} />
              )}
            </motion.button>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Mute button */}
          <motion.button onClick={toggle} title={muted ? "Unmute music" : "Mute music"}
            className="relative flex items-center justify-center w-9 h-9"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(200,169,110,0.05))",
              border: "1px solid rgba(212,175,55,0.25)",
              color: muted ? "rgba(212,175,55,0.4)" : "#d4af37",
              cursor: "pointer", borderRadius: "2px", transition: "color 0.3s, border-color 0.3s",
            }}
            whileHover={{ background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(200,169,110,0.12))", borderColor: "rgba(212,175,55,0.6)", scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            <AnimatePresence mode="wait">
              <motion.span key={muted ? "muted" : "playing"}
                initial={{ opacity: 0, scale: 0.7, rotate: -15 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 15 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </motion.span>
            </AnimatePresence>
            {playing && !muted && (
              <motion.span className="absolute inset-0"
                style={{ border: "1px solid rgba(212,175,55,0.4)", borderRadius: "2px", pointerEvents: "none" }}
                animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.25, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
            )}
          </motion.button>

          {!loading && (
            <>
              {/* Not logged in → Sign In button */}
              {!user && (
                <motion.button onClick={() => setAuthOpen(true)}
                  className="text-sm tracking-widest uppercase"
                  style={{ fontFamily: "'Cinzel', serif", color: "rgba(212,175,55,0.7)", background: "none", border: "none", cursor: "pointer", fontSize: 11, letterSpacing: "0.15em" }}
                  whileHover={{ color: "#d4af37" }} transition={{ duration: 0.2 }}>
                  Sign In
                </motion.button>
              )}

              {/* Play / DM Portal button */}
              {(role === "player" || role === "dungeon_master") && (
                <motion.button
                  onClick={() => goTo("/play")}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-5 py-2 text-sm tracking-widest uppercase"
                  style={{
                    fontFamily: "'Cinzel', serif",
                    background: role === "dungeon_master"
                      ? "linear-gradient(135deg, rgba(192,132,252,0.15), rgba(192,132,252,0.08))"
                      : "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(200,169,110,0.1))",
                    border: `1px solid ${role === "dungeon_master" ? "rgba(192,132,252,0.4)" : "rgba(212,175,55,0.4)"}`,
                    color: role === "dungeon_master" ? "#c084fc" : "#d4af37",
                    cursor: "pointer", letterSpacing: "0.1em", fontSize: 11,
                  }}
                  whileHover={{
                    background: role === "dungeon_master"
                      ? "linear-gradient(135deg, rgba(192,132,252,0.25), rgba(192,132,252,0.15))"
                      : "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(200,169,110,0.2))",
                    borderColor: role === "dungeon_master" ? "rgba(192,132,252,0.7)" : "rgba(212,175,55,0.8)",
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}>
                  {role === "dungeon_master" ? "⚔ DM Portal" : "▶ Play"}
                </motion.button>
              )}

              {/* User menu */}
              {user && (
                <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                  <motion.button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2"
                    style={{
                      fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "0.12em",
                      color: "rgba(232,217,181,0.6)", background: "rgba(13,17,32,0.8)",
                      border: "1px solid rgba(212,175,55,0.15)", cursor: "pointer",
                    }}
                    whileHover={{ borderColor: "rgba(212,175,55,0.35)" }}>
                    {/* Role dot */}
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                      background: role === "dungeon_master" ? "#c084fc" : role === "player" ? "#4ade80" : "rgba(212,175,55,0.4)",
                    }} />
                    {profile?.username ?? "Adventurer"}
                    <span style={{ fontSize: "0.5rem", opacity: 0.5 }}>▾</span>
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                        style={{
                          position: "absolute", top: "calc(100% + 8px)", right: 0,
                          minWidth: 180, background: "rgba(10,13,25,0.98)",
                          border: "1px solid rgba(212,175,55,0.2)",
                          backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          padding: "8px 0",
                        }}>
                        {/* Role badge */}
                        <div style={{ padding: "8px 16px 12px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 4 }}>Role</p>
                          <p style={{
                            fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                            color: role === "dungeon_master" ? "#c084fc" : role === "player" ? "#4ade80" : "rgba(212,175,55,0.5)",
                          }}>
                            {role === "dungeon_master" ? "⚔ Dungeon Master" : role === "player" ? "⚡ Player" : "👁 Visitor"}
                          </p>
                        </div>

                        {role === "visitor" && (
                          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.4)", lineHeight: 1.5 }}>
                              Awaiting DM approval to join the campaign.
                            </p>
                          </div>
                        )}

                        <button
                          onClick={async () => { setUserMenuOpen(false); await signOut(); }}
                          style={{
                            width: "100%", padding: "10px 16px", background: "none", border: "none",
                            color: "rgba(248,113,113,0.7)", fontFamily: "'Cinzel', serif",
                            fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase",
                            textAlign: "left", cursor: "pointer",
                          }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.7)")}
                        >
                          Leave the Realm
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {/* Begin Journey CTA — only show when not logged in */}
          {!user && (
            <motion.button onClick={() => scrollTo("Journey")}
              className="px-6 py-2 text-sm tracking-widest uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(200,169,110,0.1))",
                border: "1px solid rgba(212,175,55,0.4)", color: "#d4af37",
                cursor: "pointer", letterSpacing: "0.1em",
              }}
              whileHover={{ background: "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(200,169,110,0.2))", borderColor: "rgba(212,175,55,0.8)", scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              Begin Journey
            </motion.button>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#d4af37", cursor: "pointer" }}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden px-6 py-4 flex flex-col gap-4"
            style={{ background: "rgba(6,8,15,0.97)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
            {scrollLinks.map((link) => (
              <button key={link} onClick={() => scrollTo(link)}
                className="py-2 text-left tracking-widest uppercase text-sm"
                style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.8)", background: "none", border: "none", cursor: "pointer" }}>
                {link}
              </button>
            ))}

            <div style={{ height: 1, background: "rgba(212,175,55,0.15)" }} />

            {pageLinks.map((link) => (
              <button key={link.path} onClick={() => goTo(link.path)}
                className="py-2 text-left tracking-widest uppercase text-sm"
                style={{ fontFamily: "'Cinzel', serif", color: location.pathname === link.path ? "#d4af37" : "rgba(232,217,181,0.8)", background: "none", border: "none", cursor: "pointer" }}>
                {link.label}
              </button>
            ))}

            <div style={{ height: 1, background: "rgba(212,175,55,0.15)" }} />

            {/* Mobile auth section */}
            {!loading && (
              <>
                {!user ? (
                  <button onClick={() => { setMenuOpen(false); setAuthOpen(true); }}
                    className="py-2 text-left tracking-widest uppercase text-sm"
                    style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", background: "none", border: "none", cursor: "pointer" }}>
                    Sign In / Register
                  </button>
                ) : (
                  <>
                    <div style={{ padding: "4px 0" }}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", color: "rgba(212,175,55,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
                        Signed in as
                      </p>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: "#e8d9b5" }}>
                        {profile?.username}
                        {role === "dungeon_master" && <span style={{ marginLeft: 8, color: "#c084fc" }}>⚔ DM</span>}
                      </p>
                    </div>

                    {(role === "player" || role === "dungeon_master") && (
                      <button onClick={() => goTo("/play")}
                        className="py-2 text-left tracking-widest uppercase text-sm"
                        style={{ fontFamily: "'Cinzel', serif", color: role === "dungeon_master" ? "#c084fc" : "#d4af37", background: "none", border: "none", cursor: "pointer" }}>
                        {role === "dungeon_master" ? "⚔ DM Portal" : "▶ Play"}
                      </button>
                    )}

                    <button onClick={async () => { setMenuOpen(false); await signOut(); }}
                      className="py-2 text-left tracking-widest uppercase text-sm"
                      style={{ fontFamily: "'Cinzel', serif", color: "rgba(248,113,113,0.7)", background: "none", border: "none", cursor: "pointer" }}>
                      Leave the Realm
                    </button>
                  </>
                )}
              </>
            )}

            <div style={{ height: 1, background: "rgba(212,175,55,0.15)" }} />

            <button onClick={toggle}
              className="py-2 text-left tracking-widest uppercase text-sm flex items-center gap-2"
              style={{ fontFamily: "'Cinzel', serif", color: muted ? "rgba(212,175,55,0.4)" : "#d4af37", background: "none", border: "none", cursor: "pointer" }}>
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {muted ? "Unmute Music" : "Mute Music"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}