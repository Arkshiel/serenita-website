import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Shield, Star, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "../../lib/supabase";

// ─── Element colors map ────────────────────────────────────────────────────────
const elementColors: Record<string, string> = {
  Ignis:   "#f97316",
  Marea:   "#38bdf8",
  Fulmen:  "#c084fc",
  Aero:    "#7ecac3",
  Glacis:  "#93c5fd",
  Terrus:  "#fbbf24",
  Virael:  "#86efac",
  Spectra: "#4ade80",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Adventurer {
  id: string;
  character_name: string;
  portrait_url: string;
  class: string;
  subclass: string;
  race: string;
  element: string;
  backstory: string;
  quote: string;
  level: number;
  hp: number;
  max_hp: number;
  mana: number;
  max_mana: number;
  profiles: { username: string };
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function AdventurerCard({ adventurer, index }: { adventurer: Adventurer; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const elementColor = elementColors[adventurer.element] ?? "#d4af37";
  const playerName = adventurer.profiles?.username ?? "Unknown";
  const classLabel = [adventurer.class, adventurer.subclass].filter(Boolean).join(" · ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      style={{
        background: "linear-gradient(160deg, rgba(12,14,26,0.9) 0%, rgba(6,8,15,0.95) 100%)",
        border: `1px solid ${elementColor}22`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(to right, transparent, ${elementColor}, transparent)`,
        opacity: 0.6,
      }} />

      {/* Corner ornaments */}
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
        <div key={corner} style={{
          position: "absolute", width: 12, height: 12,
          borderColor: `${elementColor}55`, borderStyle: "solid", borderWidth: 0, zIndex: 2,
          ...(corner === "top-left"     && { top: 8,    left: 8,  borderTopWidth: 1,    borderLeftWidth: 1 }),
          ...(corner === "top-right"    && { top: 8,    right: 8, borderTopWidth: 1,    borderRightWidth: 1 }),
          ...(corner === "bottom-left"  && { bottom: 8, left: 8,  borderBottomWidth: 1, borderLeftWidth: 1 }),
          ...(corner === "bottom-right" && { bottom: 8, right: 8, borderBottomWidth: 1, borderRightWidth: 1 }),
        }} />
      ))}

{/* Portrait + header row */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Portrait */}
        <div style={{
          width: 140, minHeight: 180, flexShrink: 0,
          position: "relative", overflow: "hidden",
        }}>
          <img
            src={adventurer.portrait_url || "/images/maleunlock.png"}
            alt="Adventurer"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "top center",
              display: "block",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to right, transparent 60%, rgba(6,8,15,0.9) 100%), linear-gradient(to bottom, transparent 70%, rgba(6,8,15,0.7) 100%)`,
          }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: "20px 20px 16px" }}>
          {/* Element badge */}
          <span style={{
            fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: "0.2em",
            color: elementColor, textTransform: "uppercase",
            padding: "2px 8px", border: `1px solid ${elementColor}44`,
            background: `${elementColor}0d`, display: "inline-block", marginBottom: 10,
          }}>
            {adventurer.element}
          </span>

          {/* Name */}
          <h3 style={{
            fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700,
            color: "#e8d9b5", margin: "0 0 2px", lineHeight: 1.15,
          }}>
            {adventurer.character_name || "Unnamed"}
          </h3>

          {/* Class */}
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: 11, color: elementColor,
            letterSpacing: "0.1em", margin: "0 0 2px", textTransform: "uppercase",
          }}>
            {classLabel || "No class yet"}
          </p>
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontSize: 12,
            color: "rgba(232,217,181,0.4)", margin: "0 0 14px", fontStyle: "italic",
          }}>
            {adventurer.race || "Unknown race"}
          </p>

          {/* Player */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Star size={10} color="rgba(212,175,55,0.5)" />
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.15em",
              color: "rgba(212,175,55,0.6)", textTransform: "uppercase",
            }}>
              Played by {playerName}
            </span>
          </div>

          {/* Level pips */}
          <div style={{ display: "flex", gap: 3 }}>
            {Array.from({ length: Math.min(adventurer.level, 20) }).map((_, i) => (
              <div key={i} style={{
                width: 6, height: 6, background: elementColor,
                opacity: 0.7, transform: "rotate(45deg)",
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Quote */}
      {adventurer.quote && (
        <div style={{ padding: "0 20px", marginBottom: 0 }}>
          <div style={{
            height: 1,
            background: `linear-gradient(to right, ${elementColor}33, transparent)`,
            marginBottom: 14,
          }} />
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontSize: 15, fontStyle: "italic",
            color: "rgba(232,217,181,0.55)", margin: 0, lineHeight: 1.6,
          }}>
            "{adventurer.quote}"
          </p>
        </div>
      )}

      {/* Expand button */}
      {adventurer.backstory && (
        <>
          <motion.button
            onClick={() => setExpanded((v) => !v)}
            whileHover={{ background: `${elementColor}11` }}
            style={{
              width: "100%", padding: "12px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none",
              borderTop: `1px solid ${elementColor}15`,
              cursor: "pointer", marginTop: 14,
            }}
          >
            <span style={{
              fontFamily: "'Cinzel', serif", fontSize: 9,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(212,175,55,0.5)",
            }}>
              {expanded ? "Hide" : "Read"} Backstory
            </span>
            {expanded
              ? <ChevronUp size={12} color="rgba(212,175,55,0.5)" />
              : <ChevronDown size={12} color="rgba(212,175,55,0.5)" />
            }
          </motion.button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "16px 20px 20px" }}>
                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontSize: 16,
                    lineHeight: 1.75, color: "rgba(232,217,181,0.75)", margin: 0,
                  }}>
                    {adventurer.backstory}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export function AdventurersPage() {
  const [adventurers, setAdventurers] = useState<Adventurer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdventurers() {
      const { data, error } = await supabase
        .from("characters")
        .select(`
          *,
          profiles (username)
        `)
        .not("character_name", "is", null)
        .order("created_at", { ascending: true });

      if (!error && data) setAdventurers(data as Adventurer[]);
      setLoading(false);
    }

    fetchAdventurers();

    // Realtime — update when new characters are added
    const channel = supabase
      .channel("characters-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "characters" }, () => {
        fetchAdventurers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#06080f", position: "relative", overflowX: "hidden" }}>
      {/* Atmospheric bg */}
      <div style={{
        position: "fixed", inset: 0,
        background: "radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.04) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(212,175,55,0.03) 0%, transparent 50%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ paddingTop: 100, paddingBottom: 40, textAlign: "center" }}>
          <p style={{
            fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: "0.35em",
            color: "#d4af37", textTransform: "uppercase", margin: "0 0 12px",
          }}>
            ── Those Who Answer the Call ──
          </p>
          <h1 style={{
            fontFamily: "'Cinzel', serif", fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
            background: "linear-gradient(135deg, #d4af37 0%, #e8d9b5 50%, #c8a96e 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            margin: "0 0 10px", letterSpacing: "0.08em",
          }}>
            Adventurers
          </h1>
          <p style={{
            fontFamily: "'Crimson Pro', serif", fontSize: 17,
            color: "rgba(232,217,181,0.5)", fontStyle: "italic", margin: "0 0 6px",
          }}>
            Mortals who dared to shape the fate of nations.
          </p>

          {/* Stats strip */}
          <div style={{
            display: "inline-flex", gap: 32, marginTop: 24,
            padding: "10px 28px", border: "1px solid rgba(212,175,55,0.15)",
            background: "rgba(212,175,55,0.04)",
          }}>
            {[
              { icon: Sword,  label: "Party Size", value: adventurers.length },
              { icon: Shield, label: "Active",     value: adventurers.length },
              { icon: Star,   label: "Tier",       value: "Wanderer" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <Icon size={14} color="rgba(212,175,55,0.5)" style={{ margin: "0 auto 4px" }} />
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#d4af37", margin: "0 0 2px", fontWeight: 600 }}>
                  {value}
                </p>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", margin: 0 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem", color: "rgba(232,217,181,0.3)", fontStyle: "italic" }}>
                The chronicle is loading...
              </p>
            </div>
          ) : adventurers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem", color: "rgba(232,217,181,0.3)", fontStyle: "italic" }}>
                No adventurers have answered the call yet.
              </p>
            </div>
          ) : (
            adventurers.map((a, i) => (
              <AdventurerCard key={a.id} adventurer={a} index={i} />
            ))
          )}
        </div>

        {/* Bottom lore note */}
        <div style={{ textAlign: "center", paddingBottom: 60 }}>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: 14, fontStyle: "italic", color: "rgba(232,217,181,0.25)", margin: 0 }}>
            Their stories are still being written. Return often.
          </p>
        </div>
      </div>
    </div>
  );
}