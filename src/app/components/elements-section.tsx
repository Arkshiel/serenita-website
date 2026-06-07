import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrnateDivider } from "./ornate-divider";

const elements = [
  {
    name: "Ignis",
    kanji: "火",
    color: "#f97316",
    glow: "rgba(249,115,22,0.3)",
    bg: "rgba(249,115,22,0.06)",
    description: "The primal force of flame. Ignis wielders burn with passionate resolve, igniting reaction chains that devastate their enemies.",
    reaction: "Scorch · Combust · Wildfire",
    icon: "🔥",
    counters: ["Virael", "Glacis"],
    counteredBy: ["Marea"],
  },
  {
    name: "Marea",
    kanji: "水",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.3)",
    bg: "rgba(56,189,248,0.06)",
    description: "Flowing like the eternal tide, Marea masters reshape the battlefield, soaking foes and enabling powerful elemental reactions.",
    reaction: "Torrent · Deluge · Surge",
    icon: "💧",
    counters: ["Ignis", "Terrus"],
    counteredBy: ["Virael"],
  },
  {
    name: "Fulmen",
    kanji: "雷",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.3)",
    bg: "rgba(192,132,252,0.06)",
    description: "Crackling with divine lightning, Fulmen characters call down storms to shatter defenses and arc destruction across foes.",
    reaction: "Discharge · Arcing · Thunderclap",
    icon: "⚡",
    counters: ["Marea", "Aero"],
    counteredBy: ["Glacis"],
  },
  {
    name: "Aero",
    kanji: "嵐",
    color: "#7ecac3",
    glow: "rgba(126,202,195,0.3)",
    bg: "rgba(126,202,195,0.06)",
    description: "Ancient winds shaped by forgotten storms. Aero users summon violent gales that scatter enemies and carry the force of any element within them.",
    reaction: "Galeforce · Tempest · Cyclone",
    icon: "🌪️",
    counters: ["Fulmen", "Virael"],
    counteredBy: ["Glacis"],
  },
  {
    name: "Glacis",
    kanji: "氷",
    color: "#93c5fd",
    glow: "rgba(147,197,253,0.3)",
    bg: "rgba(147,197,253,0.06)",
    description: "Ice crystallized from deep winter dreams. Glacis attacks freeze motion and shatter foes like glass with devastating precision.",
    reaction: "Frostbite · Shatter · Permafrost",
    icon: "❄️",
    counters: ["Aero", "Ignis"],
    counteredBy: ["Fulmen"],
  },
  {
    name: "Terrus",
    kanji: "岩",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.3)",
    bg: "rgba(251,191,36,0.06)",
    description: "The unyielding earth shaped by eons of pressure. Terrus constructs crystalline barriers and shatters terrain to crush all who oppose it.",
    reaction: "Crystallize · Rupture · Landfall",
    icon: "⬡",
    counters: ["Fulmen", "Glacis"],
    counteredBy: ["Marea"],
  },
  {
    name: "Virael",
    kanji: "草",
    color: "#86efac",
    glow: "rgba(134,239,172,0.3)",
    bg: "rgba(134,239,172,0.06)",
    description: "Life blooms in nature's raw embrace. Virael ensnares foes in living vines and triggers volatile botanical chain reactions.",
    reaction: "Overgrowth · Entangle · Verdant",
    icon: "🌿",
    counters: ["Terrus", "Marea"],
    counteredBy: ["Ignis"],
  },
  {
    name: "Spectra",
    kanji: "霊",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.3)",
    bg: "rgba(74,222,128,0.06)",
    description: "Power drawn from the boundary between existence and void. Spectra wielders command spectral forces, draining life and bending the line between worlds.",
    reaction: "Hollow · Wraith · Dissolution",
    icon: "👻",
    counters: [],
    counteredBy: [],
  },
];

const elementMap = Object.fromEntries(elements.map((e) => [e.name, e]));

// ── Counter Modal ────────────────────────────────────────────────────────────
function CounterModal({ onClose }: { onClose: () => void }) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const isCounters = (a: string, b: string) =>
    elementMap[a]?.counters.includes(b);
  const isCounteredBy = (a: string, b: string) =>
    elementMap[a]?.counteredBy.includes(b);

  return (
    <AnimatePresence>
      <motion.div
        key="counter-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <motion.div
          key="counter-panel"
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            maxWidth: 820,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            background: "linear-gradient(135deg, #09101f, #0d1526)",
            border: "1px solid rgba(212,175,55,0.3)",
            boxShadow: "0 0 60px rgba(212,175,55,0.1), 0 0 120px rgba(0,0,0,0.6)",
            padding: "40px 36px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(212,175,55,0.3) transparent",
          }}
        >
          {/* Corner accents */}
          {[
            { top: 0, left: 0, borderTop: "2px solid #d4af37", borderLeft: "2px solid #d4af37" },
            { top: 0, right: 0, borderTop: "2px solid #d4af37", borderRight: "2px solid #d4af37" },
            { bottom: 0, left: 0, borderBottom: "2px solid #d4af37", borderLeft: "2px solid #d4af37" },
            { bottom: 0, right: 0, borderBottom: "2px solid #d4af37", borderRight: "2px solid #d4af37" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: 24, height: 24, zIndex: 2, ...s }} />
          ))}

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.25em", color: "#d4af37", textTransform: "uppercase", marginBottom: 8 }}>
              Elemental Codex
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "1.8rem", color: "#e8d9b5", fontWeight: 700, marginBottom: 8 }}>
              Counter Relationships
            </h2>
            <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.5)", fontSize: "1rem" }}>
              Hover an element to highlight its strengths and weaknesses
            </p>
            <div style={{ marginTop: 12, height: 1, background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)" }} />
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 28, flexWrap: "wrap" }}>
            {[
              { color: "#4ade80", label: "Counters (strong against)" },
              { color: "#f87171", label: "Countered By (weak against)" },
              { color: "rgba(212,175,55,0.4)", label: "Neutral" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: "rgba(232,217,181,0.5)", textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Counter grid rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {elements.map((el) => (
              <motion.div
                key={el.name}
                onHoverStart={() => setHighlighted(el.name)}
                onHoverEnd={() => setHighlighted(null)}
                whileHover={{ x: 4 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  background: highlighted === el.name ? el.bg : "rgba(13,17,32,0.6)",
                  border: `1px solid ${highlighted === el.name ? el.color + "55" : "rgba(200,169,110,0.1)"}`,
                  transition: "all 0.3s ease",
                  cursor: "default",
                }}
              >
                {/* Element name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.3rem" }}>{el.icon}</span>
                  <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: highlighted === el.name ? el.color : "#e8d9b5",
                    transition: "color 0.3s",
                    letterSpacing: "0.05em",
                  }}>
                    {el.name}
                  </span>
                </div>

                {/* Counter pills row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {el.counters.length === 0 && el.counteredBy.length === 0 ? (
                    <span style={{
                      fontFamily: "'Crimson Pro', serif",
                      fontSize: "0.85rem",
                      color: "rgba(232,217,181,0.35)",
                      fontStyle: "italic",
                    }}>
                      Beyond the cycle — untouched by all
                    </span>
                  ) : (
                    <>
                      {elements.filter((e) => e.name !== el.name).map((other) => {
                        const strong = isCounters(el.name, other.name);
                        const weak = isCounteredBy(el.name, other.name);
                        if (!strong && !weak) return null;
                        return (
                          <motion.div
                            key={other.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 10px",
                              background: strong
                                ? "rgba(74,222,128,0.1)"
                                : "rgba(248,113,113,0.1)",
                              border: `1px solid ${strong ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}`,
                            }}
                          >
                            <span style={{ fontSize: "0.75rem" }}>{other.icon}</span>
                            <span style={{
                              fontFamily: "'Cinzel', serif",
                              fontSize: "0.65rem",
                              letterSpacing: "0.08em",
                              color: strong ? "#4ade80" : "#f87171",
                              textTransform: "uppercase",
                            }}>
                              {strong ? "▲" : "▼"} {other.name}
                            </span>
                          </motion.div>
                        );
                      })}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <p style={{ marginTop: 28, textAlign: "center", fontFamily: "'Crimson Pro', serif", fontSize: "0.9rem", color: "rgba(232,217,181,0.3)", fontStyle: "italic" }}>
            ▲ Strong Against &nbsp;·&nbsp; ▼ Weak Against
          </p>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, background: "rgba(212,175,55,0.2)" }}
            whileTap={{ scale: 0.9 }}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 32,
              height: 32,
              background: "rgba(6,8,15,0.8)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "rgba(232,217,181,0.6)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              zIndex: 10,
              lineHeight: 1,
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

// ── Main Section ─────────────────────────────────────────────────────────────
export function ElementsSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);

  return (
    <>
      <section
        id="elements"
        className="relative py-28 px-6 overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #06080f 0%, #080b14 50%, #06080f 100%)",
        }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>
              Forces of Existence
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#e8d9b5", fontWeight: 700 }}>
              The Eight Elements
            </h2>
            <div className="mt-4 max-w-xs mx-auto">
              <OrnateDivider />
            </div>
            <p className="mt-6 max-w-xl mx-auto" style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.6)", fontSize: "1.1rem", lineHeight: 1.8 }}>
              Eight elemental forces govern all of existence in Serenita, each bound to ancient sovereigns whose power flows through chosen champions.
            </p>
          </motion.div>

          {/* Elements grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {elements.map((el, i) => (
              <motion.div
                key={el.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
                style={{
                  position: "relative",
                  background: hoveredIndex === i ? el.bg : "rgba(13,17,32,0.8)",
                  border: `1px solid ${hoveredIndex === i ? el.color + "66" : "rgba(200,169,110,0.15)"}`,
                  padding: "24px 20px",
                  cursor: "default",
                  transition: "all 0.4s ease",
                  overflow: "hidden",
                }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: `1px solid ${el.color}44`, borderLeft: `1px solid ${el.color}44` }} />
                <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: `1px solid ${el.color}44`, borderRight: `1px solid ${el.color}44` }} />

                {hoveredIndex === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${el.glow} 0%, transparent 70%)` }}
                  />
                )}

                <div
                  className="absolute -right-2 -bottom-2 pointer-events-none select-none"
                  style={{
                    fontFamily: "serif",
                    fontSize: "6rem",
                    color: hoveredIndex === i ? el.color : "rgba(200,169,110,0.06)",
                    lineHeight: 1,
                    transition: "color 0.4s ease",
                    fontWeight: 900,
                  }}
                >
                  {el.kanji}
                </div>

                <div className="text-3xl mb-3">{el.icon}</div>
                <h3 style={{ fontFamily: "'Cinzel', serif", color: hoveredIndex === i ? el.color : "#e8d9b5", fontSize: "1rem", fontWeight: 600, marginBottom: "8px", transition: "color 0.3s ease" }}>
                  {el.name}
                </h3>
                <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.55)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "12px" }}>
                  {el.description}
                </p>
                <div
                  style={{ fontFamily: "'Cinzel', serif", color: hoveredIndex === i ? el.color + "cc" : "rgba(200,169,110,0.3)", fontSize: "0.65rem", letterSpacing: "0.08em", transition: "color 0.3s ease" }}
                >
                  {el.reaction}
                </div>
              </motion.div>
            ))}

            {/* CTA Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.72 }}
              className="col-span-2 sm:col-span-3 lg:col-span-4"
              style={{
                border: "1px solid rgba(212,175,55,0.15)",
                padding: "24px 32px",
                background: "rgba(13,17,32,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37" }}>
                  Elemental Mastery
                </p>
                <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.65)", fontSize: "1rem" }}>
                  Every element holds dominion over another — know your strengths, or fall to your weaknesses.
                </p>
              </div>
              <motion.button
                onClick={() => setCounterModalOpen(true)}
                style={{
                  fontFamily: "'Cinzel', serif",
                  padding: "10px 28px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(200,169,110,0.08))",
                  border: "1px solid rgba(212,175,55,0.35)",
                  color: "#d4af37",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
                whileHover={{ background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(200,169,110,0.15))", borderColor: "rgba(212,175,55,0.7)", scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                View Counter Chart
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {counterModalOpen && <CounterModal onClose={() => setCounterModalOpen(false)} />}
    </>
  );
}