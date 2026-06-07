import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrnateDivider, GenshinBorder } from "./ornate-divider";

const characters = [
  // ── UNLOCKED ──────────────────────────────────────────────────────────────
  {
    id: 1,
    locked: false,
    gender: "female",
    name: "KAGURA",
    title: "The Obsidian Feather",
    element: "Aero",
    elementColor: "#7ecac3",
    elementBg: "rgba(126,202,195,0.1)",
    rarity: 5,
    nation: "Ardos",
    description: "A enigmatic wanderer from a distant land, wrapped in the guise of a black-winged tengu. Drawn to Mondstadt by the free-flowing winds, she watches over the city from the shadows of the Whispering Woods, wielding her staff to command violent, swirling gales.",
    image: "/images/char1.jpg",
    stats: { ATK: 72, DEF: 54, SPD: 93 },
    fullProfile: {
      age: "Unknown",
      weapon: "Polearm",
      constellation: "Corvus Ater",
      affiliation: "Whispering Woods",
      lore: "Kagura, the enigmatic Obsidian Feather, is a figure of Mondstadt folklore, said to be a descendant of an ancient, nocturnal tengu clan. Though she appears human-like, her tattered crow wings and fiery horns tell of a different origin. She now drifts between the ancient ruins and the forests of Mondstadt, a silent watcher. Wielding her custom Khakkhara staff, she has mastered the gales, creating localized tempests to protect her solitary existence. Her purpose is as mysterious as her wings.",
      abilities: ["Galeburst Khakkhara — Aero DMG, AoE knockback, and pull", "Wings of Obsidian — Elemental Burst: Forms powerful crow-feather blades for swift cutting, dealing high Aero DMG", "Tengu's Drift — Passive: Increased Movement Speed and Gliding Stamina reduction for the party"],
    },
  },
  {
    id: 2,
    locked: false,
    gender: "female",
    name: "VEYRA",
    title: "Sovereign of the Hollow Throne",
    element: "Spectra",
    elementColor: "#4ade80",
    elementBg: "rgba(74,222,128,0.1)",
    rarity: 5,
    nation: "Velmoor",
    description: "A sovereign wrapped in emerald shadow, Veyra commands the boundary between life and dissolution. Her spectral scythe cleaves through mortal and ethereal alike, and the ghostly flames that trail her crown speak of a kingdom long consumed by the void.",
    image: "/images/char2.jpg",
    stats: { ATK: 86, DEF: 90, SPD: 65 },
    fullProfile: {
      age: "Unknown",
      weapon: "Scythe",
      constellation: "Viridis Umbra",
      affiliation: "The Hollow Court",
      lore: "Once the ruling queen of Velmoor, Veyra surrendered her mortality to preserve her crumbling nation from annihilation. The pact she struck with a formless entity granted her dominion over spectral energy — but erased every trace of warmth from her soul. Now she presides over a throne of ash and memory, her emerald flames the only light in a kingdom of eternal dusk. Few who seek audience with her return unchanged.",
      abilities: ["Void Reap — Spectra DMG scythe slash with lifesteal", "Hollow Coronation — Elemental Burst: Summons spectral apparitions that converge and detonate", "Queen's Pact — Passive: Converts excess DEF into bonus ATK for the party"],
    },
  },
  {
    id: 3,
    locked: false,
    gender: "female",
    name: "RYNN",
    title: "The Blazing Tempest",
    element: "Ignis",
    elementColor: "#f97316",
    elementBg: "rgba(249,115,22,0.1)",
    rarity: 5,
    nation: "Ignarath",
    description: "A wild and ferocious fighter from the scorched borderlands, Rynn tears through the battlefield like a living wildfire. Her curved blade ignites everything it touches, and her burning red mane blazes like an inferno given human form.",
    image: "/images/char3.jpg",
    stats: { ATK: 85, DEF: 80, SPD: 82 },
    fullProfile: {
      age: "24",
      weapon: "Blade",
      constellation: "Ignis Ferox",
      affiliation: "Ignarath Rovers",
      lore: "Born in the perpetually burning wastes of Ignarath, Rynn grew up fighting for survival against both the scorched landscape and the warlords who claimed it. She honed her blade in a hundred border skirmishes, each scar a lesson written in fire. Joining the Ignarath Rovers — a band of mercenary peacekeepers — she found purpose beyond survival. Now she fights not just to win, but to burn down every unjust throne she encounters, one blazing strike at a time.",
      abilities: ["Inferno Slash — Pyro blade arc with burn DoT", "Wildfire Surge — Elemental Burst: Unleashes a spiraling fire tornado dealing massive AoE Pyro DMG", "Blaze Runner — Passive: Sprint triggers Pyro trail that ignites enemies behind her"],
    },
  },

  // ── LOCKED — 1 female, 4 males ────────────────────────────────────────────
  {
    id: 4,
    locked: true,
    gender: "female",
    name: "???",
    title: "???",
    element: "???",
    elementColor: "#6b7280",
    elementBg: "rgba(107,114,128,0.1)",
    rarity: 5,
    nation: "???",
    description: "???",
    image: "/images/femaleunlock.png",
    stats: { ATK: 0, DEF: 0, SPD: 0 },
    fullProfile: { age: "???", weapon: "???", constellation: "???", affiliation: "???", lore: "???", abilities: ["???", "???", "???"] },
  },
  {
    id: 5,
    locked: true,
    gender: "male",
    name: "???",
    title: "???",
    element: "???",
    elementColor: "#6b7280",
    elementBg: "rgba(107,114,128,0.1)",
    rarity: 5,
    nation: "???",
    description: "???",
    image: "/images/maleunlock.png",
    stats: { ATK: 0, DEF: 0, SPD: 0 },
    fullProfile: { age: "???", weapon: "???", constellation: "???", affiliation: "???", lore: "???", abilities: ["???", "???", "???"] },
  },
  {
    id: 6,
    locked: true,
    gender: "male",
    name: "???",
    title: "???",
    element: "???",
    elementColor: "#6b7280",
    elementBg: "rgba(107,114,128,0.1)",
    rarity: 5,
    nation: "???",
    description: "???",
    image: "/images/maleunlock.png",
    stats: { ATK: 0, DEF: 0, SPD: 0 },
    fullProfile: { age: "???", weapon: "???", constellation: "???", affiliation: "???", lore: "???", abilities: ["???", "???", "???"] },
  },
  {
    id: 7,
    locked: true,
    gender: "male",
    name: "???",
    title: "???",
    element: "???",
    elementColor: "#6b7280",
    elementBg: "rgba(107,114,128,0.1)",
    rarity: 5,
    nation: "???",
    description: "???",
    image: "/images/maleunlock.png",
    stats: { ATK: 0, DEF: 0, SPD: 0 },
    fullProfile: { age: "???", weapon: "???", constellation: "???", affiliation: "???", lore: "???", abilities: ["???", "???", "???"] },
  },
  {
    id: 8,
    locked: true,
    gender: "male",
    name: "???",
    title: "???",
    element: "???",
    elementColor: "#6b7280",
    elementBg: "rgba(107,114,128,0.1)",
    rarity: 5,
    nation: "???",
    description: "???",
    image: "/images/maleunlock.png",
    stats: { ATK: 0, DEF: 0, SPD: 0 },
    fullProfile: { age: "???", weapon: "???", constellation: "???", affiliation: "???", lore: "???", abilities: ["???", "???", "???"] },
  },
];

const ElementIcon = ({ element, color }: { element: string; color: string }) => {
  if (element === "???") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
        <path d="M12 8v1M12 15v1" strokeLinecap="round" />
      </svg>
    );
  }
  const icons: Record<string, string> = {
    Aero: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
    Ignis: "M12 2L8 8H4l4 4-2 6 6-3 6 3-2-6 4-4h-4z",
    Spectra: "M13 2L4 14h8l-1 8 9-12h-8z",
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d={icons[element] || icons.Aero} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Lock overlay icon
const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(200,169,110,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

// ── Full Profile Modal ──────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function ProfileModal({ char, onClose }: { char: typeof characters[0]; onClose: () => void }) {
  const isLocked = char.locked;
  const width = useWindowWidth();
  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 900;
  const isDesktop = width >= 900;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: isMobile ? "12px" : "24px",
        }}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: isDesktop ? "minmax(0, 2fr) minmax(0, 3fr)" : "1fr",
            gap: 0,
            maxWidth: isDesktop ? 900 : isTablet ? 600 : "100%",
            width: "100%",
            maxHeight: "90vh",
            background: "linear-gradient(135deg, #09101f, #0d1526)",
            border: `1px solid ${char.elementColor}44`,
            boxShadow: `0 0 60px ${char.elementColor}22, 0 0 120px rgba(0,0,0,0.6)`,
            overflow: "hidden",
            overflowY: "auto",
          }}
        >
          {/* Corner accents */}
          {[
            { top: 0, left: 0, borderTop: `2px solid ${char.elementColor}`, borderLeft: `2px solid ${char.elementColor}` },
            { top: 0, right: 0, borderTop: `2px solid ${char.elementColor}`, borderRight: `2px solid ${char.elementColor}` },
            { bottom: 0, left: 0, borderBottom: `2px solid ${char.elementColor}`, borderLeft: `2px solid ${char.elementColor}` },
            { bottom: 0, right: 0, borderBottom: `2px solid ${char.elementColor}`, borderRight: `2px solid ${char.elementColor}` },
          ].map((style, i) => (
            <div key={i} style={{ position: "absolute", width: 24, height: 24, zIndex: 2, ...style }} />
          ))}

          {/* Left — image */}
          <div style={{
            position: "relative", overflow: "hidden",
            minHeight: isMobile ? 240 : isTablet ? 340 : 480,
          }}>
            <motion.img
              src={char.image}
              alt={char.name}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                filter: isLocked ? "brightness(0.25) grayscale(0.8)" : "brightness(0.85) saturate(1.1)",
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: isLocked
                ? "linear-gradient(to right, rgba(0,0,0,0.4) 60%, #09101f 100%)"
                : isDesktop
                  ? `linear-gradient(to right, transparent 60%, #09101f 100%), linear-gradient(to top, rgba(6,8,15,0.85) 0%, transparent 50%), linear-gradient(135deg, ${char.elementColor}22 0%, transparent 60%)`
                  : `linear-gradient(to bottom, transparent 40%, rgba(6,8,15,0.95) 100%), linear-gradient(135deg, ${char.elementColor}22 0%, transparent 60%)`,
            }} />

            {/* Lock overlay */}
            {isLocked && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <LockIcon />
                </motion.div>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  color: "rgba(200,169,110,0.35)",
                  textTransform: "uppercase",
                }}>
                  Identity Hidden
                </p>
              </div>
            )}

            {/* Element badge */}
            {!isLocked && (
              <div style={{
                position: "absolute", top: 16, left: 16,
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(6,8,15,0.7)",
                border: `1px solid ${char.elementColor}55`,
                padding: "6px 12px", backdropFilter: "blur(4px)",
              }}>
                <ElementIcon element={char.element} color={char.elementColor} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.15em", color: char.elementColor, textTransform: "uppercase" }}>
                  {char.element}
                </span>
              </div>
            )}

            {/* Name overlay */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "14px" : "20px" }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.4)", textTransform: "uppercase", marginBottom: 4 }}>
                {isLocked ? "Nation of ???" : `Nation of ${char.nation}`}
              </p>
              <h2 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: isMobile ? "1.3rem" : isTablet ? "1.6rem" : "2rem",
                color: isLocked ? "rgba(107,114,128,0.6)" : "#e8d9b5",
                fontWeight: 700, lineHeight: 1,
              }}>
                {char.name}
              </h2>
              <p style={{ fontFamily: "'Crimson Pro', serif", color: isLocked ? "rgba(107,114,128,0.5)" : char.elementColor, fontSize: "1rem", marginTop: 4 }}>
                {char.title}
              </p>
              <p style={{ marginTop: 6, fontSize: "0.7rem", color: isLocked ? "rgba(107,114,128,0.3)" : "rgba(212,175,55,0.7)", letterSpacing: "0.05em" }}>
                {"★".repeat(char.rarity)}
              </p>
            </div>
          </div>

          {/* Right — profile info */}
          <div style={{
            overflowY: "auto",
            padding: isMobile ? "20px 16px" : isTablet ? "28px 24px" : "32px 28px",
            display: "flex", flexDirection: "column", gap: 20,
            scrollbarWidth: "thin",
            scrollbarColor: `${char.elementColor}44 transparent`,
          }}>
            {/* Stats */}
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Combat Stats
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(char.stats).map(([stat, val], i) => (
                  <div key={stat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 28, fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "rgba(232,217,181,0.45)", textTransform: "uppercase" }}>
                      {stat}
                    </span>
                    <div style={{ flex: 1, height: 3, borderRadius: 9999, background: "rgba(200,169,110,0.12)" }}>
                      <motion.div
                        style={{ height: "100%", borderRadius: 9999, background: isLocked ? "rgba(107,114,128,0.3)" : `linear-gradient(to right, ${char.elementColor}, ${char.elementColor}88)` }}
                        initial={{ width: 0 }}
                        animate={{ width: isLocked ? "0%" : `${val}%` }}
                        transition={{ duration: 0.9, delay: 0.1 * i, ease: "easeOut" }}
                      />
                    </div>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: isLocked ? "rgba(107,114,128,0.5)" : char.elementColor, width: 24, textAlign: "right" }}>
                      {isLocked ? "0" : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: `linear-gradient(to right, ${char.elementColor}44, transparent)` }} />

            {/* Profile grid */}
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Profile
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {[
                  ["Weapon", char.fullProfile.weapon],
                  ["Constellation", char.fullProfile.constellation],
                  ["Affiliation", char.fullProfile.affiliation],
                  ["Age", char.fullProfile.age],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: "8px 12px", background: `${char.elementColor}0d`, border: `1px solid ${char.elementColor}22` }}>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(232,217,181,0.35)", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.95rem", color: isLocked ? "rgba(107,114,128,0.5)" : "#e8d9b5" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: `linear-gradient(to right, ${char.elementColor}44, transparent)` }} />

            {/* Lore */}
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.35)", textTransform: "uppercase", marginBottom: 8 }}>
                Lore
              </p>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.05rem", color: isLocked ? "rgba(107,114,128,0.4)" : "rgba(232,217,181,0.75)", lineHeight: 1.8 }}>
                {char.fullProfile.lore}
              </p>
            </div>

            <div style={{ height: 1, background: `linear-gradient(to right, ${char.elementColor}44, transparent)` }} />

            {/* Abilities */}
            <div>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.35)", textTransform: "uppercase", marginBottom: 10 }}>
                Abilities
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {char.fullProfile.abilities.map((ability, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 14px",
                      background: `${char.elementColor}0d`,
                      border: `1px solid ${char.elementColor}22`,
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: isLocked ? "rgba(107,114,128,0.4)" : char.elementColor, marginTop: 6, flexShrink: 0 }} />
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.95rem", color: isLocked ? "rgba(107,114,128,0.4)" : "rgba(232,217,181,0.8)" }}>{ability}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, background: `${char.elementColor}33` }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "absolute", top: 14, right: 14,
              width: 32, height: 32,
              background: "rgba(6,8,15,0.8)",
              border: `1px solid ${char.elementColor}44`,
              color: "rgba(232,217,181,0.6)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.1rem", zIndex: 10, lineHeight: 1,
              transition: "background 0.2s",
            }}
          >
            ✕
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Section ────────────────────────────────────────────────────────────
export function CharactersSection() {
  const [active, setActive] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const char = characters[active];

  return (
    <>
      <section id="characters" className="relative py-28 px-6 overflow-hidden" style={{ background: "linear-gradient(to bottom, #06080f, #0a0d1a, #06080f)" }}>
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${char.elementBg.replace("0.1", "0.06")} 0%, transparent 70%)`,
            filter: "blur(60px)",
            transition: "background 0.8s ease",
          }}
        />

        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>
              Heroes of Legend
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#e8d9b5", fontWeight: 700 }}>
              Champions of Serenita
            </h2>
            <div className="mt-4 max-w-xs mx-auto">
              <OrnateDivider />
            </div>
          </motion.div>

          {/* Character selector tabs — 8 total */}
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {characters.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => setActive(i)}
                style={{
                  fontFamily: "'Cinzel', serif",
                  padding: "8px 24px",
                  background: active === i
                    ? c.locked
                      ? "rgba(107,114,128,0.15)"
                      : `linear-gradient(135deg, ${c.elementColor}33, ${c.elementColor}11)`
                    : "rgba(13,17,32,0.8)",
                  border: `1px solid ${active === i
                    ? c.locked ? "rgba(107,114,128,0.4)" : c.elementColor
                    : "rgba(200,169,110,0.2)"}`,
                  color: active === i
                    ? c.locked ? "rgba(107,114,128,0.7)" : c.elementColor
                    : "rgba(232,217,181,0.5)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {c.locked && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                )}
                {c.name}
              </motion.button>
            ))}
          </div>

          {/* Character showcase */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Left — character image */}
              <div className="flex justify-center">
                <GenshinBorder className="relative w-full max-w-sm">
                  <div
                    className="relative overflow-hidden"
                    style={{
                      background: char.locked
                        ? "linear-gradient(135deg, rgba(20,20,30,0.95), rgba(13,17,32,0.9))"
                        : `linear-gradient(135deg, ${char.elementBg}, rgba(13,17,32,0.9))`,
                      aspectRatio: "3/4",
                    }}
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      className="w-full h-full object-cover"
                      style={{
                        filter: char.locked
                          ? "brightness(0.2) grayscale(0.9)"
                          : "brightness(0.85) saturate(1.1)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: char.locked
                          ? "linear-gradient(to top, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.3) 60%, transparent 100%)"
                          : `linear-gradient(to top, rgba(6,8,15,0.9) 0%, rgba(6,8,15,0.2) 50%, transparent 100%),
                             linear-gradient(135deg, ${char.elementColor}22 0%, transparent 60%)`,
                      }}
                    />

                    {/* Lock overlay */}
                    {char.locked && (
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 16,
                      }}>
                        <motion.div
                          animate={{ opacity: [0.4, 0.9, 0.4], scale: [0.97, 1.03, 0.97] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{
                            padding: 20,
                            border: "1px solid rgba(200,169,110,0.15)",
                            borderRadius: "50%",
                            background: "rgba(6,8,15,0.5)",
                          }}
                        >
                          <LockIcon />
                        </motion.div>
                        <p style={{
                          fontFamily: "'Cinzel', serif",
                          fontSize: "0.6rem",
                          letterSpacing: "0.3em",
                          color: "rgba(200,169,110,0.3)",
                          textTransform: "uppercase",
                        }}>
                          Coming Soon
                        </p>
                      </div>
                    )}

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      {!char.locked && (
                        <div className="flex items-center gap-2 mb-1">
                          <ElementIcon element={char.element} color={char.elementColor} />
                          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif", color: char.elementColor }}>
                            {char.element}
                          </span>
                          <span className="text-xs" style={{ color: "rgba(212,175,55,0.6)" }}>
                            {"★".repeat(char.rarity)}
                          </span>
                        </div>
                      )}
                      <h3 style={{
                        fontFamily: "'Cinzel', serif",
                        color: char.locked ? "rgba(107,114,128,0.5)" : "#e8d9b5",
                        fontSize: "1.6rem", fontWeight: 700,
                      }}>
                        {char.name}
                      </h3>
                      <p className="text-xs" style={{
                        color: char.locked ? "rgba(107,114,128,0.4)" : char.elementColor,
                        fontFamily: "'Crimson Pro', serif",
                      }}>
                        {char.title}
                      </p>
                    </div>
                  </div>
                </GenshinBorder>
              </div>

              {/* Right — info panel */}
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.4)" }}>
                    Nation of {char.nation}
                  </p>
                  <h3 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "2.5rem",
                    color: char.locked ? "rgba(107,114,128,0.5)" : "#e8d9b5",
                    fontWeight: 700,
                  }}>
                    {char.name}
                  </h3>
                  <p style={{
                    fontFamily: "'Crimson Pro', serif",
                    color: char.locked ? "rgba(107,114,128,0.4)" : char.elementColor,
                    fontSize: "1.1rem",
                  }}>
                    {char.title}
                  </p>
                </div>

                <p style={{
                  fontFamily: "'Crimson Pro', serif",
                  color: char.locked ? "rgba(107,114,128,0.35)" : "rgba(232,217,181,0.7)",
                  fontSize: "1.15rem", lineHeight: 1.8,
                }}>
                  {char.locked
                    ? "This champion's identity has not yet been revealed. Their story will unfold in time..."
                    : char.description}
                </p>

                {/* Stats */}
                <div className="space-y-3">
                  <p className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.4)" }}>
                    Combat Stats
                  </p>
                  {Object.entries(char.stats).map(([stat, val]) => (
                    <div key={stat} className="flex items-center gap-3">
                      <span className="w-8 text-xs tracking-widest uppercase" style={{ fontFamily: "'Cinzel', serif", color: "rgba(232,217,181,0.5)" }}>
                        {stat}
                      </span>
                      <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(200,169,110,0.15)" }}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: char.locked
                              ? "rgba(107,114,128,0.2)"
                              : `linear-gradient(to right, ${char.elementColor}, ${char.elementColor}88)`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: char.locked ? "0%" : `${val}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs w-6" style={{
                        color: char.locked ? "rgba(107,114,128,0.4)" : char.elementColor,
                        fontFamily: "'Cinzel', serif",
                      }}>
                        {char.locked ? "0" : val}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => setModalOpen(true)}
                  style={{
                    fontFamily: "'Cinzel', serif",
                    padding: "12px 32px",
                    background: char.locked
                      ? "rgba(107,114,128,0.08)"
                      : `linear-gradient(135deg, ${char.elementColor}33, ${char.elementColor}11)`,
                    border: char.locked
                      ? "1px solid rgba(107,114,128,0.2)"
                      : `1px solid ${char.elementColor}66`,
                    color: char.locked ? "rgba(107,114,128,0.4)" : char.elementColor,
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    alignSelf: "flex-start",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  whileHover={char.locked ? {} : {
                    background: `linear-gradient(135deg, ${char.elementColor}55, ${char.elementColor}22)`,
                    borderColor: char.elementColor,
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  {char.locked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  )}
                  {char.locked ? "Identity Sealed" : "View Full Profile"}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && <ProfileModal char={char} onClose={() => setModalOpen(false)} />}
    </>
  );
}