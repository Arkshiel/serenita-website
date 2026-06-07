import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrnateDivider } from "./ornate-divider";
import { Sword, Drama, ScrollText, X } from "lucide-react";

const oaths = [
  {
    icon: Sword,
    title: "You Will Bleed",
    description: "Combat in Serenita is merciless. Every wound tells a story, every scar earns its place. Death is not a reset — it is a consequence.",
    color: "#f97316",
    quote: "\"Steel teaches what words cannot.\"",
  },
  {
    icon: Drama,
    title: "You Will Choose",
    description: "Alliances shift, kingdoms rise and fall, and every decision ripples across the world. There are no right answers — only the ones you can live with.",
    color: "#d4af37",
    quote: "\"Even silence is a choice.\"",
  },
  {
    icon: ScrollText,
    title: "You Will Be Remembered",
    description: "The chronicle of Serenita is written by those who dare to act. Your name, your deeds, your failures — they will outlast you.",
    color: "#c084fc",
    quote: "\"Legends are forged, not born.\"",
  },
];

// ── Lore text — replace the paragraphs below with your real lore later ──────
const LORE_TITLE = "The Chronicle of Serenita";
const LORE_SUBTITLE = "As recorded by the Scribes of the Ember Throne";
const LORE_PARAGRAPHS = [
  "In the age before memory, eight nations rose from the bones of a broken world. Each was born of a different wound — some of fire, some of tide, some of shadow — and each carries that wound still, hidden beneath banners and treaties and the careful smiles of diplomats.",
  "Serenita is the name the mapmakers gave to the land between them. It is not a kingdom. It is a scar.",
  "For three hundred years, the Accord of Embers has held the nations in an uneasy peace. Trade flows. Borders are respected. The old wars are called history. But history, in Serenita, has a way of coming back — not as memory, but as consequence.",
  "Something has changed. The Accord strains. Old grievances surface in new courts. Scouts return from the borderlands speaking of things that should not exist, or should not exist yet. And in the capital of every nation, someone powerful has begun to make plans.",
  "You arrive in this world not as heroes. Not yet. You arrive as people — with debts and names and reasons of your own. What you become is still unwritten.",
  "The chronicle awaits its next chapter. Whether it is written in gold or ash depends entirely on the choices made at the table.",
];

function LoreScroll({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4,5,10,0.85)",
        backdropFilter: "blur(8px)",
        padding: "24px",
      }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ scaleY: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          transformOrigin: "top center",
        }}
      >
        {/* ── Top scroll rod ── */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "100%",
            height: 18,
            background: "linear-gradient(180deg, #c8a96e 0%, #8b6914 40%, #6b4f10 60%, #a0712c 100%)",
            borderRadius: 9,
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 3,
              left: 20,
              right: 20,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
            }} />
          </div>
          <div style={{
            position: "absolute",
            left: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #e8c96e, #8b6914)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }} />
          <div style={{
            position: "absolute",
            right: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #e8c96e, #8b6914)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }} />
        </div>

        {/* ── Scroll body ── */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          style={{
            transformOrigin: "top center",
            background: "linear-gradient(160deg, #1a1408 0%, #120f05 40%, #0e0b04 70%, #1a1408 100%)",
            borderLeft: "3px solid #6b4f10",
            borderRight: "3px solid #6b4f10",
            padding: "40px 52px",
            position: "relative",
            overflow: "hidden",
            maxHeight: "65vh",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 28px,
                rgba(212,175,55,0.03) 28px,
                rgba(212,175,55,0.03) 29px
              )
            `,
            pointerEvents: "none",
          }} />

          <div style={{ position: "absolute", top: 0, inset: "0 0 auto 0", height: 40, background: "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, inset: "auto 0 0 0", height: 40, background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)", pointerEvents: "none" }} />

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "none",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "rgba(212,175,55,0.5)",
              cursor: "pointer",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "2px",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#d4af37";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,175,55,0.5)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.2)";
            }}
          >
            <X size={13} />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <svg width="36" height="36" viewBox="0 0 72 72" fill="none">
                <path d="M36 4L42 24H64L47 37L53 58L36 45L19 58L25 37L8 24H30L36 4Z" fill="url(#scrollGrad)" opacity="0.7" />
                <defs>
                  <linearGradient id="scrollGrad" x1="8" y1="4" x2="64" y2="58" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e8d9b5" />
                    <stop offset="1" stopColor="#8b6914" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#e8d9b5",
              textAlign: "center",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}>
              {LORE_TITLE}
            </h2>

            <p style={{
              fontFamily: "'Crimson Pro', serif",
              fontStyle: "italic",
              color: "rgba(212,175,55,0.5)",
              fontSize: "0.82rem",
              textAlign: "center",
              letterSpacing: "0.1em",
              marginBottom: 28,
            }}>
              {LORE_SUBTITLE}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, justifyContent: "center" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, rgba(212,175,55,0.3), transparent)" }} />
              <div style={{ width: 4, height: 4, background: "#d4af37", transform: "rotate(45deg)", opacity: 0.6 }} />
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)" }} />
            </div>

            {LORE_PARAGRAPHS.map((para, i) => (
              <p
                key={i}
                style={{
                  fontFamily: "'Crimson Pro', serif",
                  color: "rgba(232,217,181,0.75)",
                  fontSize: "1.05rem",
                  lineHeight: 1.85,
                  marginBottom: i < LORE_PARAGRAPHS.length - 1 ? 18 : 0,
                  textIndent: "1.5em",
                }}
              >
                {para}
              </p>
            ))}

            <div style={{
              marginTop: 32,
              padding: "12px 20px",
              border: "1px solid rgba(212,175,55,0.15)",
              background: "rgba(212,175,55,0.04)",
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "rgba(212,175,55,0.35)",
                textTransform: "uppercase",
              }}>
                The full chronicle is still being written
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Bottom scroll rod ── */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "100%",
            height: 18,
            background: "linear-gradient(180deg, #c8a96e 0%, #8b6914 40%, #6b4f10 60%, #a0712c 100%)",
            borderRadius: 9,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 3,
              left: 20,
              right: 20,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
            }} />
          </div>
          <div style={{
            position: "absolute",
            left: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #e8c96e, #8b6914)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }} />
          <div style={{
            position: "absolute",
            right: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #e8c96e, #8b6914)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CtaSection() {
  const [scrollOpen, setScrollOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <section
        id="journey"
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: "linear-gradient(to bottom, #06080f, #080a15, #06080f)" }}
      >
        {/* Radial background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)" }} />

        <div className="max-w-5xl mx-auto relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>
              The Three Oaths of Serenita
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.6rem, 4vw, 2.8rem)", color: "#e8d9b5", fontWeight: 700 }}>
              Know What Awaits You
            </h2>
            <div className="mt-4 max-w-xs mx-auto">
              <OrnateDivider />
            </div>
          </motion.div>

          {/* Oath cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {oaths.map((oath, i) => (
              <motion.div
                key={oath.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="flex flex-col items-center text-center p-7"
                style={{
                  background: "rgba(13,17,32,0.7)",
                  border: "1px solid rgba(200,169,110,0.1)",
                  position: "relative",
                }}
                whileHover={{ y: -6, borderColor: `${oath.color}55` }}
              >
                <div className="absolute top-0 left-0 w-5 h-5" style={{ borderTop: `1px solid ${oath.color}66`, borderLeft: `1px solid ${oath.color}66` }} />
                <div className="absolute top-0 right-0 w-5 h-5" style={{ borderTop: `1px solid ${oath.color}66`, borderRight: `1px solid ${oath.color}66` }} />
                <div className="absolute bottom-0 left-0 w-5 h-5" style={{ borderBottom: `1px solid ${oath.color}66`, borderLeft: `1px solid ${oath.color}66` }} />
                <div className="absolute bottom-0 right-0 w-5 h-5" style={{ borderBottom: `1px solid ${oath.color}66`, borderRight: `1px solid ${oath.color}66` }} />

                <div className="mb-5 p-3" style={{ background: `${oath.color}12`, border: `1px solid ${oath.color}33`, borderRadius: "2px" }}>
                  <oath.icon size={22} style={{ color: oath.color }} />
                </div>

                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.3em", color: `${oath.color}77`, textTransform: "uppercase", marginBottom: "8px" }}>
                  {["I", "II", "III"][i]} — The {["First", "Second", "Third"][i]} Oath
                </p>

                <h3 style={{ fontFamily: "'Cinzel', serif", color: "#e8d9b5", fontSize: "1.15rem", fontWeight: 700, marginBottom: "12px", letterSpacing: "0.04em" }}>
                  {oath.title}
                </h3>

                <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.6)", fontSize: "0.95rem", lineHeight: 1.75, marginBottom: "16px" }}>
                  {oath.description}
                </p>

                <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: oath.color, fontSize: "0.88rem", opacity: 0.8 }}>
                  {oath.quote}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Main CTA block */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="text-center"
          >
            <p className="text-xs tracking-widest uppercase mb-4" style={{ fontFamily: "'Cinzel', serif", color: "#d4af37", letterSpacing: "0.25em" }}>
              The Seat Awaits
            </p>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 800,
                background: "linear-gradient(180deg, #ffffff 0%, #e8d9b5 40%, #c8a96e 70%, #8b6914 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              Answer the Call of Serenita
            </h2>

            <div className="max-w-xs mx-auto mb-6">
              <OrnateDivider />
            </div>

            <p className="max-w-lg mx-auto mb-10" style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.65)", fontSize: "1.15rem", lineHeight: 1.8 }}>
              The world breathes, the nations stir, and the chronicle has yet to be written.
              One seat remains at the table. Will you take it?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Request a Seat — opens Google Form */}
              <motion.button
                onClick={() => setFormOpen(true)}
                style={{
                  fontFamily: "'Cinzel', serif",
                  padding: "16px 48px",
                  background: "linear-gradient(135deg, #d4af37, #c8a96e, #a0712c)",
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
                whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(212,175,55,0.45)" }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.25), transparent)" }}
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                Request a Seat
              </motion.button>

              {/* Read the Lore — opens scroll */}
              <motion.button
                onClick={() => setScrollOpen(true)}
                style={{
                  fontFamily: "'Cinzel', serif",
                  padding: "16px 48px",
                  background: "transparent",
                  color: "rgba(232,217,181,0.7)",
                  border: "1px solid rgba(200,169,110,0.3)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
                whileHover={{
                  color: "#e8d9b5",
                  borderColor: "rgba(200,169,110,0.6)",
                  scale: 1.02,
                }}
                whileTap={{ scale: 0.97 }}
              >
                Read the Lore
              </motion.button>
            </div>

            {/* Session info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-10 flex items-center justify-center gap-3 flex-wrap"
            >
              {[
                { label: "Format", value: "TBD" },
                { label: "System", value: "D&D 5e" },
                { label: "Tone", value: "Dark Fantasy" },
                { label: "Session Zero", value: "TBD" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center px-4 py-2"
                  style={{ border: "1px solid rgba(212,175,55,0.15)", background: "rgba(6,8,15,0.6)" }}
                >
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(232,217,181,0.3)", textTransform: "uppercase", marginBottom: "2px" }}>
                    {item.label}
                  </span>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: "#d4af37" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.2), transparent)" }} />
      </section>

      {/* Lore scroll modal */}
      <AnimatePresence>
        {scrollOpen && <LoreScroll onClose={() => setScrollOpen(false)} />}
      </AnimatePresence>

      {/* Google Form modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setFormOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(4,5,10,0.9)",
              backdropFilter: "blur(8px)",
              padding: "24px",
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 660,
                border: "1px solid rgba(212,175,55,0.3)",
                background: "#06080f",
                boxShadow: "0 0 60px rgba(212,175,55,0.1)",
              }}
            >
              {/* Header bar */}
              <div style={{
                padding: "14px 20px",
                borderBottom: "1px solid rgba(212,175,55,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <p style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.25em",
                  color: "#d4af37",
                  textTransform: "uppercase",
                }}>
                  Request a Seat — Serenita Campaign
                </p>
                <button
                  onClick={() => setFormOpen(false)}
                  style={{
                    background: "none",
                    border: "1px solid rgba(212,175,55,0.2)",
                    color: "rgba(212,175,55,0.5)",
                    cursor: "pointer",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#d4af37";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,175,55,0.5)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,175,55,0.2)";
                  }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Google Form iframe — replace src with your embed URL */}
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSdtqr0LCwN4wSSv5Z-F2AIpT7frCCqXLxqRoVAFJbeU0q6uaQ/viewform?usp=header"
                width="100%"
                height="580"
                frameBorder="0"
                style={{ display: "block" }}
              >
                Loading…
              </iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}