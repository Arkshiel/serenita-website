import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./auth-provider";

const DICE = [
  { label: "D4", sides: 4, color: "#f97316" },
  { label: "D6", sides: 6, color: "#eab308" },
  { label: "D8", sides: 8, color: "#22c55e" },
  { label: "D10", sides: 10, color: "#38bdf8" },
  { label: "D12", sides: 12, color: "#a78bfa" },
  { label: "D20", sides: 20, color: "#d4af37" },
  { label: "D100", sides: 100, color: "#f43f5e" },
];

interface Roll {
  id: string;
  username: string;
  die_type: string;
  result: number;
  rolled_at: string;
  player_id: string;
}

export function DiceRoller() {
  const { profile, user } = useAuth();
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [currentRoll, setCurrentRoll] = useState<{ result: number; die: typeof DICE[0] } | null>(null);
  const [rolling, setRolling] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Load recent rolls
  useEffect(() => {
    const fetchRolls = async () => {
      const { data } = await supabase
        .from("dice_rolls")
        .select("*")
        .order("rolled_at", { ascending: false })
        .limit(20);
      if (data) setRolls(data);
    };
    fetchRolls();

    // Realtime subscription
    const channel = supabase
      .channel("dice_rolls")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dice_rolls" }, (payload) => {
        setRolls((prev) => [payload.new as Roll, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const rollDie = async (die: typeof DICE[0]) => {
    if (rolling || !user || !profile) return;
    setRolling(true);

    // Animate
    const result = Math.floor(Math.random() * die.sides) + 1;
    setAnimKey((k) => k + 1);
    setCurrentRoll({ result, die });

    // Save to DB
    await supabase.from("dice_rolls").insert({
      player_id: user.id,
      username: profile.username,
      die_type: die.label,
      result,
    });

    setTimeout(() => setRolling(false), 800);
  };

  const clearRolls = async () => {
    await supabase.from("dice_rolls").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setRolls([]);
    setCurrentRoll(null);
  };

  const isCrit = (roll: Roll) => roll.die_type === "D20" && roll.result === 20;
  const isFumble = (roll: Roll) => roll.die_type === "D20" && roll.result === 1;
  const isMax = (roll: Roll) => {
    const die = DICE.find((d) => d.label === roll.die_type);
    return die ? roll.result === die.sides : false;
  };

  const getDieColor = (dieType: string) => DICE.find((d) => d.label === dieType)?.color ?? "#d4af37";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "0 16px" }}>

      {/* Dramatic result display */}
      <div style={{ textAlign: "center", minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          {currentRoll ? (
            <motion.div key={animKey}
              initial={{ scale: 0.3, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ textAlign: "center" }}
            >
              {/* Die label */}
              <p style={{
                fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.25em",
                color: currentRoll.die.color, textTransform: "uppercase", marginBottom: 8,
              }}>
                {currentRoll.die.label} Roll
              </p>

              {/* Big number */}
              <motion.div
                animate={rolling ? { rotate: [0, -10, 10, -6, 6, 0] } : {}}
                transition={{ duration: 0.5 }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "clamp(5rem, 15vw, 9rem)",
                  fontWeight: 700,
                  lineHeight: 1,
                  color: currentRoll.result === 1 && currentRoll.die.label === "D20"
                    ? "#f87171"
                    : currentRoll.result === currentRoll.die.sides
                    ? "#fbbf24"
                    : currentRoll.die.color,
                  textShadow: `0 0 40px ${currentRoll.die.color}66`,
                }}
              >
                {currentRoll.result}
              </motion.div>

              {/* Crit / Fumble label */}
              {currentRoll.die.label === "D20" && currentRoll.result === 20 && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "0.3em", color: "#fbbf24", textTransform: "uppercase", marginTop: 8 }}>
                  ✦ Critical Hit ✦
                </motion.p>
              )}
              {currentRoll.die.label === "D20" && currentRoll.result === 1 && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "0.3em", color: "#f87171", textTransform: "uppercase", marginTop: 8 }}>
                  ✦ Critical Fail ✦
                </motion.p>
              )}
              {currentRoll.die.label !== "D20" && currentRoll.result === currentRoll.die.sides && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", letterSpacing: "0.3em", color: "#fbbf24", textTransform: "uppercase", marginTop: 8 }}>
                  ✦ Maximum Roll ✦
                </motion.p>
              )}
            </motion.div>
          ) : (
            <motion.p key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem", color: "rgba(232,217,181,0.25)", fontStyle: "italic" }}>
              Select a die to roll...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Dice buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 480 }}>
        {DICE.map((die) => (
          <motion.button key={die.label} onClick={() => rollDie(die)}
            disabled={rolling}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.92 }}
            style={{
              fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.15em",
              padding: "12px 20px", cursor: rolling ? "not-allowed" : "pointer",
              background: `linear-gradient(135deg, ${die.color}18, ${die.color}08)`,
              border: `1px solid ${die.color}55`,
              color: die.color,
              transition: "all 0.2s ease",
              opacity: rolling ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!rolling) (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${die.color}33` }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none" }}
          >
            {die.label}
          </motion.button>
        ))}
      </div>

      {/* Shared roll feed */}
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(212,175,55,0.5)", textTransform: "uppercase" }}>
            Roll History
          </p>
          {rolls.length > 0 && (
            <button onClick={clearRolls}
              style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(248,113,113,0.5)", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#f87171")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.5)")}
            >
              Clear
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <AnimatePresence initial={false}>
            {rolls.length === 0 && (
              <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.25)", fontSize: "0.9rem", textAlign: "center", padding: "24px 0", fontStyle: "italic" }}>
                No rolls yet. Begin your fate.
              </p>
            )}
            {rolls.map((roll) => (
              <motion.div key={roll.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: isCrit(roll) ? "rgba(251,191,36,0.06)" : isFumble(roll) ? "rgba(248,113,113,0.06)" : "rgba(13,17,32,0.6)",
                  border: isCrit(roll) ? "1px solid rgba(251,191,36,0.2)" : isFumble(roll) ? "1px solid rgba(248,113,113,0.2)" : "1px solid rgba(212,175,55,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Die type badge */}
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.1em",
                    padding: "3px 7px", border: `1px solid ${getDieColor(roll.die_type)}44`,
                    color: getDieColor(roll.die_type), textTransform: "uppercase",
                  }}>
                    {roll.die_type}
                  </span>
                  <span style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.6)", fontSize: "0.9rem" }}>
                    {roll.username}
                  </span>
                  {isCrit(roll) && <span style={{ fontSize: "0.7rem" }}>✦</span>}
                  {isFumble(roll) && <span style={{ fontSize: "0.7rem" }}>💀</span>}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: "1.3rem", fontWeight: 700,
                    color: isCrit(roll) ? "#fbbf24" : isFumble(roll) ? "#f87171" : isMax(roll) ? "#fbbf24" : getDieColor(roll.die_type),
                  }}>
                    {roll.result}
                  </span>
                  <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.75rem", color: "rgba(232,217,181,0.2)" }}>
                    {new Date(roll.rolled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}