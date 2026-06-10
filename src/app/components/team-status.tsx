import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./auth-provider";
import { Swords, Plus, ChevronRight, SkipForward, Shield, Heart, Skull, Sparkles, X } from "lucide-react";
import { SwordClash } from "./sword-clash";

interface Character {
  id: string;
  character_name: string;
  class: string;
  race: string;
  level: number;
  hp: number;
  max_hp: number;
  temp_hp: number;
  mana: number;
  max_mana: number;
  ac: number;
  dexterity: number;
  initiative_bonus: number;
  conditions: string[];
  portrait_url: string;
}

interface InitiativeEntry {
  id: string;
  character_id: string | null;
  is_monster: boolean;
  monster_name: string | null;
  monster_hp: number;
  monster_max_hp: number;
  monster_ac: number;
  initiative: number;
  conditions: { name: string; turns: number }[];
  // joined
  character?: Character;
}

interface BattleSession {
  id: string;
  active: boolean;
  round: number;
  current_turn_index: number;
  clash_triggered_at?: string;
}

export function TeamStatus() {
  const { user } = useAuth();
  const [isDM, setIsDM] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [session, setSession] = useState<BattleSession | null>(null);
  const [entries, setEntries] = useState<InitiativeEntry[]>([]);
  const [myCharacter, setMyCharacter] = useState<Character | null>(null);
  const [hasRolled, setHasRolled] = useState(false);
  const [showMonsterForm, setShowMonsterForm] = useState(false);
  const [monsterDraft, setMonsterDraft] = useState({ name: "", hp: "", ac: "", initiative: "" });
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef<BattleSession | null>(null);
  const lastClashRef = useRef<string | null>(null);
  const [showClash, setShowClash] = useState(false);

  // Check if DM
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("role").eq("id", user.id).single()
      .then(({ data }) => {
        if (data?.role === "dungeon_master") setIsDM(true);
      });
  }, [user]);

  // Load my character
  useEffect(() => {
    if (!user) return;
    supabase.from("characters").select("*").eq("player_id", user.id).single()
      .then(({ data }) => { if (data) setMyCharacter(data); });
  }, [user]);

  // Load all characters
    useEffect(() => {
    supabase.from("characters").select("*").order("created_at", { ascending: true }).then(({ data }) => {
        if (data) setCharacters([...data]);
    });
    // Also keep myCharacter loaded via the existing useEffect above
    }, []);

  // Load or create session + entries
  useEffect(() => {
    const load = async () => {
    const { data: sessionData } = await supabase
        .from("battle_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (sessionData) {
        setSession(sessionData);
        await loadEntries(sessionData.id);
        sessionRef.current = sessionData;
    } else {
        // Auto-create a session if none exists
        const { data: newSession } = await supabase
        .from("battle_sessions")
        .insert({ active: false, round: 1, current_turn_index: 0 })
        .select()
        .single();
        if (newSession) setSession(newSession);
    }
    setLoading(false);
    };
    load();
  }, []);

    const loadEntries = async (sessionId: string) => {
    const { data } = await supabase
        .from("initiative_rolls")
        .select("*, character:characters(*)")
        .eq("session_id", sessionId)
        .order("initiative", { ascending: false });
    if (data) {
        setEntries(data);
        setMyCharacter(prev => {
        if (prev) {
            const mine = data.find(e => e.character_id === prev.id);
            if (mine) setHasRolled(true);
        }
        return prev;
        });
    }
    };


    // Realtime
    useEffect(() => {
    const channel = supabase.channel(`team-battle-${Math.random()}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "characters" }, () => {
    supabase.from("characters").select("*").order("created_at", { ascending: true }).then(({ data }) => {
        if (data) setCharacters([...data]);
    });
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "battle_sessions" }, (payload) => {
      if (payload.eventType === "DELETE") return;
      if (payload.new) {
        const incoming = payload.new as BattleSession;
        const isNewSession = incoming.id !== sessionRef.current?.id;

        // Only trigger clash when clash_triggered_at is newly set (not null→null or same value)
        const newClash = (payload.new as any)?.clash_triggered_at ?? null;
        if (newClash && newClash !== lastClashRef.current) {
          lastClashRef.current = newClash;
          setShowClash(true);
        }

        setSession(incoming);
        sessionRef.current = incoming;

        if (isNewSession) {
          setEntries([]);
          setHasRolled(false);
        }
      }
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "initiative_rolls" }, async () => {
    const sid = sessionRef.current?.id;
    if (sid) {
        loadEntries(sid);
    } else {
        // sessionRef not ready yet, re-fetch session then load entries
        const { data } = await supabase
        .from("battle_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        if (data) {
        sessionRef.current = data;
        setSession(data);
        loadEntries(data.id);
        }
    }
    })
        .subscribe();
    return () => { supabase.removeChannel(channel); };
    }, []); // empty deps — subscribes once, uses ref for session id

    const rollInitiative = async () => {
    if (!myCharacter || !session || hasRolled) return;
    const d20 = Math.floor(Math.random() * 20) + 1;
    const dexMod = Math.floor(((myCharacter.dexterity ?? 10) - 10) / 2);
    const total = d20 + dexMod + (myCharacter.initiative_bonus ?? 0);
    await supabase.from("initiative_rolls").insert({
        session_id: session.id,
        character_id: myCharacter.id,
        is_monster: false,
        initiative: total,
        conditions: [],
    });
    setHasRolled(true);
    await loadEntries(session.id);
    };

  const startBattle = async () => {
    if (!session) return;
    const clashTime = new Date().toISOString();
    lastClashRef.current = clashTime;
    setShowClash(true);
    await supabase.from("battle_sessions")
      .update({ active: true, round: 1, current_turn_index: 0, clash_triggered_at: clashTime })
      .eq("id", session.id);
    const updated = { ...session, active: true, round: 1, current_turn_index: 0, clash_triggered_at: clashTime };
    sessionRef.current = updated;  // ← keep ref in sync
    setSession(updated);           // ← actually update the UI
  };

  const newSession = async () => {
    await supabase.from("battle_sessions").insert({ active: false, round: 1, current_turn_index: 0 });
    // reload
    const { data } = await supabase.from("battle_sessions").select("*").order("created_at", { ascending: false }).limit(1).single();
    if (data) { setSession(data); sessionRef.current = data; setEntries([]); setHasRolled(false); }
  };

  const advanceTurn = async () => {
    const current = sessionRef.current;
    if (!current || entries.length === 0) return;

    // Tick down condition turns for the entry whose turn just ended
  const currentEntry = entries[current.current_turn_index];
  if (currentEntry) {
    const updatedConditions = currentEntry.conditions
      .map(c => ({ ...c, turns: c.turns - 1 }))
      .filter(c => c.turns > 0);
    await supabase.from("initiative_rolls")
      .update({ conditions: updatedConditions })
      .eq("id", currentEntry.id);
  }

    // Build list of alive indices
    const aliveIndices = entries.reduce<number[]>((acc, entry, i) => {
      const char = entry.is_monster
        ? null
        : characters.find(c => c.id === entry.character_id) ?? entry.character;
      const hp = char?.hp ?? entry.monster_hp;
      if (hp > 0) acc.push(i);
      return acc;
    }, []);

    if (aliveIndices.length === 0) return;

    // Find next alive index after current
    const nextAlive = aliveIndices.find(i => i > current.current_turn_index)
      ?? aliveIndices[0]; // wrap around to first alive

    const newRound = nextAlive <= current.current_turn_index
      ? current.round + 1
      : current.round;

    const updated = { ...current, current_turn_index: nextAlive, round: newRound };
    sessionRef.current = updated;
    setSession(updated);
    await supabase
      .from("battle_sessions")
      .update({ current_turn_index: nextAlive, round: newRound })
      .eq("id", current.id);
  };

    const addMonster = async () => {
    if (!session || !monsterDraft.name) return;
    const hp = parseInt(monsterDraft.hp) || 10;
    const ac = parseInt(monsterDraft.ac) || 10;
    const init = monsterDraft.initiative !== ""
        ? parseInt(monsterDraft.initiative)
        : Math.floor(Math.random() * 20) + 1;
    await supabase.from("initiative_rolls").insert({
        session_id: session.id,
        is_monster: true,
        monster_name: monsterDraft.name,
        monster_hp: hp,
        monster_max_hp: hp,
        monster_ac: ac,
        initiative: init,
        conditions: [],
    });
    await loadEntries(session.id); // force reload
    };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, color: "#8b7355", fontFamily: "serif" }}>
      Gathering the party…
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {myCharacter && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(196,169,107,0.06)", border: "1px solid rgba(196,169,107,0.2)", borderRadius: 10, padding: "6px 12px 6px 6px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(196,169,107,0.3)", flexShrink: 0 }}>
                {myCharacter.portrait_url
                  ? <img src={myCharacter.portrait_url.split("?")[0]} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                  : <div style={{ width: "100%", height: "100%", background: "rgba(0,0,0,0.4)" }} />
                }
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e0d5", fontFamily: "serif" }}>{myCharacter.character_name}</div>
                <div style={{ fontSize: 9, color: "#c4a96b", fontFamily: "serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>Dungeon Master</div>
              </div>
            </div>
          )}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#c4a96b", fontFamily: "serif", margin: 0 }}>
              {session?.active ? `⚔ Battle — Round ${session.round}` : "Session Hub"}
            </h2>
            <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", fontFamily: "serif" }}>
              {session?.active ? `${entries.length} combatants` : "Waiting for battle to begin"}
            </p>
          </div>
        </div>
        {isDM && (
        <div style={{ display: "flex", gap: 8 }}>
            {!session?.active && (
            <button onClick={startBattle} style={dmBtnStyle("#c4a96b")}>
                <Swords size={13} /> Start Battle
            </button>
            )}
            {session?.active && (
            <button onClick={advanceTurn} style={dmBtnStyle("#34d399")}>
                <SkipForward size={13} /> Next Turn
            </button>
            )}
            <button onClick={() => setShowMonsterForm(v => !v)} style={dmBtnStyle("#f87171")}>
            <Plus size={13} /> Add Enemy
            </button>
            <button onClick={newSession} style={dmBtnStyle("#6b7280")}>
            New Session
            </button>
        </div>
        )}
      </div>


        {/* Party overview — always visible */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        <p style={{ fontSize: 10, color: "#6b7280", fontFamily: "serif", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>Party</p>
        {characters.filter(char => char.id !== myCharacter?.id || !isDM).map(char => (
            <div key={char.id} style={{
            background: "rgba(30,24,16,0.7)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
            }}>
            <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", border: "1px solid rgba(196,169,107,0.2)", background: "rgba(0,0,0,0.4)", flexShrink: 0 }}>
                {char.portrait_url
                ? <img src={char.portrait_url.split("?")[0]} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4b5563", fontSize: 14 }}>?</div>
                }
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e5e0d5", fontFamily: "serif" }}>{char.character_name}</div>
                <div style={{ fontSize: 10, color: "#6b7280" }}>{char.race} {char.class} • Lvl {char.level}</div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                <div style={{ textAlign: "center" }}>
                <div style={{ color: "#22c55e", fontWeight: 700 }}>{char.hp}/{char.max_hp}</div>
                <div style={{ color: "#6b7280" }}>HP</div>
                </div>
                <div style={{ textAlign: "center" }}>
                <div style={{ color: "#60a5fa", fontWeight: 700 }}>{char.ac}</div>
                <div style={{ color: "#6b7280" }}>AC</div>
                </div>
                <div style={{ textAlign: "center" }}>
                <div style={{ color: "#a78bfa", fontWeight: 700 }}>{char.mana}/{char.max_mana}</div>
                <div style={{ color: "#6b7280" }}>Mana</div>
                </div>
                {isDM && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={async () => {
                    const newHp = Math.max(0, char.hp - 1);
                    await supabase.from("characters").update({ hp: newHp }).eq("id", char.id);
                    setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, hp: newHp } : c));
                    }} style={{ width: 18, height: 18, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <button onClick={async () => {
                    const newHp = Math.min(char.max_hp, char.hp + 1);
                    await supabase.from("characters").update({ hp: newHp }).eq("id", char.id);
                    setCharacters(prev => prev.map(c => c.id === char.id ? { ...c, hp: newHp } : c));
                    }} style={{ width: 18, height: 18, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 4, color: "#22c55e", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                )}
            </div>
            </div>
        ))}
        </div>

        {isDM && showMonsterForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "rgba(30,14,14,0.95)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 10, padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
            {[["Name", "name", "text"], ["HP", "hp", "number"], ["AC", "ac", "number"]].map(([label, field, type]) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 10, color: "#9ca3af", fontFamily: "serif" }}>{label}</label>
                <input type={type} placeholder={field === "initiative" ? "auto-roll" : ""}
                value={monsterDraft[field as keyof typeof monsterDraft]}
                onChange={e => setMonsterDraft(d => ({ ...d, [field]: e.target.value }))}
                style={{ width: field === "name" ? 140 : 70, padding: "6px 10px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, color: "#f1e8d8", fontFamily: "serif", fontSize: 13 }} />
            </div>
            ))}
            <button onClick={addMonster} style={{ ...dmBtnStyle("#f87171"), alignSelf: "flex-end" }}>
              <Plus size={13} /> Add
            </button>
            <button onClick={() => { setShowMonsterForm(false); setMonsterDraft({ name: "", hp: "", ac: "", initiative: "" }); }} style={{ ...dmBtnStyle("#6b7280"), alignSelf: "flex-end" }}>
              <X size={13} /> Done
            </button>
        </motion.div>
        )}

      {/* Player roll button */}
      {!isDM && session && !hasRolled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, rgba(30,24,16,0.95), rgba(17,14,11,0.9))",
            border: "1px solid rgba(196,169,107,0.2)",
            borderRadius: 12, padding: 24, textAlign: "center", marginBottom: 20,
          }}
        >
          <p style={{ color: "#8b7355", fontFamily: "serif", fontSize: 13, marginBottom: 16 }}>
            {hasRolled ? "✓ You've rolled — waiting for the DM to start battle" : "The DM is preparing battle. Roll your initiative!"}
          </p>
          {!hasRolled && (
            <button onClick={rollInitiative} style={{
              padding: "10px 28px", background: "rgba(196,169,107,0.1)",
              border: "1px solid rgba(196,169,107,0.4)", borderRadius: 8,
              color: "#c4a96b", fontFamily: "serif", fontSize: 14,
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              <Swords size={15} /> Roll Initiative (d20 + {Math.floor(((myCharacter?.dexterity ?? 10) - 10) / 2) + (myCharacter?.initiative_bonus ?? 0)})
            </button>
          )}
        </motion.div>
      )}

      {/* Initiative entries */}
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {entries.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#4b5563", fontFamily: "serif" }}>
        <Skull size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
        <p>No one has rolled yet.</p>
        </div>
    )}
    {entries.map((entry, index) => {
        const isCurrentTurn = session?.active && session.current_turn_index === index;
        const char = entry.is_monster
        ? null
        : characters.find(c => c.id === entry.character_id) ?? entry.character;
        const hp = char?.hp ?? entry.monster_hp;
        const maxHp = char?.max_hp ?? entry.monster_max_hp;
        const hpPct = maxHp > 0 ? Math.min(100, (hp / maxHp) * 100) : 0;
        const hpColor = hpPct > 60 ? "#22c55e" : hpPct > 30 ? "#f59e0b" : "#ef4444";
        const isDowned = hp <= 0;

        return (
        <motion.div
            key={entry.id}
            layout
            animate={isCurrentTurn ? { borderColor: "rgba(196,169,107,0.6)" } : { borderColor: "rgba(255,255,255,0.06)" }}
            style={{
            background: isCurrentTurn
                ? "linear-gradient(135deg, rgba(196,169,107,0.08), rgba(17,14,11,0.95))"
                : isDowned
                ? "linear-gradient(135deg, rgba(127,29,29,0.12), rgba(17,14,11,0.9))"
                : "linear-gradient(135deg, rgba(30,24,16,0.95), rgba(17,14,11,0.9))",
            border: "1px solid",
            borderRadius: 10, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 14,
            }}
        >
            {/* Turn indicator */}
            <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}>
            {isCurrentTurn
                ? <ChevronRight size={18} color="#c4a96b" />
                : <span style={{ fontSize: 12, color: "#4b5563", fontFamily: "serif" }}>{index + 1}</span>
            }
            </div>

            {/* Portrait or monster icon */}
            <div style={{
            width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0,
            border: "1px solid rgba(196,169,107,0.2)",
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            }}>
            {char?.portrait_url
                ? <img src={char.portrait_url.split("?")[0]} alt={char.character_name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                : <Skull size={16} color={entry.is_monster ? "#ef4444" : "#6b7280"} />
            }
            </div>

            {/* Name + HP */}
            <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: entry.is_monster ? "#fca5a5" : "#e5e0d5", fontFamily: "serif" }}>
                {entry.is_monster ? entry.monster_name : char?.character_name}
                </span>
                {!entry.is_monster && char && (
                <span style={{ fontSize: 10, color: "#6b7280" }}>{char.race} {char.class} • Lvl {char.level}</span>
                )}
            </div>
            {/* HP bar */}
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${hpPct}%`, background: hpColor, borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "#6b7280" }}>{hp}/{maxHp} HP</span>
                {/* DM HP controls for monsters */}
                {isDM && entry.is_monster && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={async () => {
                    const newHp = Math.max(0, entry.monster_hp - 1);
                    await supabase.from("initiative_rolls").update({ monster_hp: newHp }).eq("id", entry.id);
                    await loadEntries(session!.id);
                    }} style={{ width: 18, height: 18, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <input
                    type="number"
                    defaultValue={1}
                    id={`dmg-${entry.id}`}
                    style={{ width: 36, padding: "1px 4px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "#f1e8d8", fontFamily: "serif", fontSize: 11, textAlign: "center" }}
                    />
                    <button onClick={async () => {
                    const amt = parseInt((document.getElementById(`dmg-${entry.id}`) as HTMLInputElement)?.value) || 1;
                    const newHp = Math.max(0, entry.monster_hp - amt);
                    await supabase.from("initiative_rolls").update({ monster_hp: newHp }).eq("id", entry.id);
                    await loadEntries(session!.id);
                    }} style={{ padding: "1px 6px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 10, fontFamily: "serif" }}>dmg</button>
                    <button onClick={async () => {
                    const amt = parseInt((document.getElementById(`dmg-${entry.id}`) as HTMLInputElement)?.value) || 1;
                    const newHp = Math.min(entry.monster_max_hp, entry.monster_hp + amt);
                    await supabase.from("initiative_rolls").update({ monster_hp: newHp }).eq("id", entry.id);
                    await loadEntries(session!.id);
                    }} style={{ padding: "1px 6px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 4, color: "#22c55e", cursor: "pointer", fontSize: 10, fontFamily: "serif" }}>heal</button>
                </div>
                )}
            </div>
            {/* Conditions */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                {entry.conditions?.map((c, i) => (
                  <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, padding: "1px 6px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }}>
                    {c.name}
                    {isDM && (
                      <>
                        <input type="number" min={1} max={99} value={c.turns}
                          onChange={async (e) => {
                            const updated = entry.conditions.map((x, idx) => idx === i ? { ...x, turns: Number(e.target.value) } : x);
                            await supabase.from("initiative_rolls").update({ conditions: updated }).eq("id", entry.id);
                            await loadEntries(session!.id);
                          }}
                          style={{ width: 28, background: "transparent", border: "none", color: "#c4a96b", fontFamily: "serif", fontSize: 9, textAlign: "center" }}
                        />
                        <span style={{ color: "#6b7280" }}>t</span>
                        <span onClick={async () => {
                          const updated = entry.conditions.filter((_, idx) => idx !== i);
                          await supabase.from("initiative_rolls").update({ conditions: updated }).eq("id", entry.id);
                          await loadEntries(session!.id);
                        }} style={{ cursor: "pointer", color: "#ef4444" }}>×</span>
                      </>
                    )}
                  </span>
                ))}
                {isDM && (
                <select onChange={async (e) => {
                    if (!e.target.value) return;
                    const updated = [...(entry.conditions || []), { name: e.target.value, turns: 1 }];
                    await supabase.from("initiative_rolls").update({ conditions: updated }).eq("id", entry.id);
                    await loadEntries(session!.id);
                    e.target.value = "";
                }} style={{ fontSize: 9, padding: "1px 4px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#9ca3af", cursor: "pointer" }}>
                    <option value="">+ condition</option>
                    {["Poisoned","Stunned","Blinded","Frightened","Paralyzed","Incapacitated","Prone","Restrained","Charmed","Invisible","Concentrating","Bleeding"].map(c => (
                    <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                )}
            </div>
            </div>

            {/* Initiative badge */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#c4a96b", fontFamily: "serif" }}>{entry.initiative}</div>
            <div style={{ fontSize: 9, color: "#6b7280" }}>INIT</div>
            </div>

            {/* AC */}
            {(char?.ac || entry.monster_ac) ? (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
                <Shield size={12} color="#60a5fa" style={{ margin: "0 auto 2px" }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", fontFamily: "serif" }}>{char?.ac ?? entry.monster_ac}</div>
                <div style={{ fontSize: 9, color: "#6b7280" }}>AC</div>
            </div>
            ) : null}

            {/* DM remove button for monsters */}
            {isDM && entry.is_monster && (
                <button
                    onClick={async () => {
                    await supabase.from("initiative_rolls").delete().eq("id", entry.id);
                    await loadEntries(session!.id); // add this line
                    }}
                    style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 8px", color: "#ef4444", cursor: "pointer" }}
                >
                    <X size={12} />
                </button>
                )}
        </motion.div>
        );
    })}
    </div>
        {showClash && <SwordClash onComplete={() => setShowClash(false)} />}
    </div>
  );
}

const dmBtnStyle = (color: string): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 6,
  padding: "7px 14px", background: "transparent",
  border: `1px solid ${color}55`, borderRadius: 8,
  color, fontFamily: "serif", fontSize: 12, cursor: "pointer",
});