import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import {
  Shield, Zap, Heart, Star, ChevronDown, ChevronUp,
  Edit3, Check, X, Plus, Minus, Skull, Sparkles, Activity,
  Wind, Eye, BookOpen, Swords, FlameKindling
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

interface Character {
  id: string;
  user_id: string;
  character_name: string;
  class: string;
  subclass: string;
  race: string;
  level: number;
  exp: number;
  hp: number;
  max_hp: number;
  temp_hp: number;
  mana: number;
  max_mana: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  ac: number;
  initiative_bonus: number;
  speed: number;
  proficiency_bonus: number;
  inspiration: boolean;
  conditions: string[];
  death_saves_success: number;
  death_saves_failure: number;
  notes: string;
  portrait_url: string;
  profiles: { username: string };
}

const CONDITIONS = [
  "Blinded", "Charmed", "Deafened", "Exhausted", "Frightened",
  "Grappled", "Incapacitated", "Invisible", "Paralyzed", "Petrified",
  "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious",
  "Blessed", "Hasted", "Raging", "Concentrating", "Inspired"
];

const CONDITION_COLORS: Record<string, string> = {
  Blinded: "#6b7280", Charmed: "#ec4899", Deafened: "#6b7280",
  Exhausted: "#9ca3af", Frightened: "#7c3aed", Grappled: "#b45309",
  Incapacitated: "#dc2626", Invisible: "#a78bfa", Paralyzed: "#dc2626",
  Petrified: "#6b7280", Poisoned: "#16a34a", Prone: "#92400e",
  Restrained: "#b45309", Stunned: "#7c3aed", Unconscious: "#dc2626",
  Blessed: "#fbbf24", Hasted: "#34d399", Raging: "#ef4444",
  Concentrating: "#60a5fa", Inspired: "#f59e0b",
};

// ─── Stat nudge button ──────────────────────────────────────────────────────

function NudgeButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: 4,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#c4a96b", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 14, lineHeight: 1,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,169,107,0.2)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
    >
      {children}
    </button>
  );
}

// ─── Inline editable number field ──────────────────────────────────────────

function StatField({
  label, value, field, characterId, onUpdate, color = "#c4a96b", min = 0, max = 999
}: {
  label: string; value: number; field: string; characterId: string;
  onUpdate: (field: string, value: number) => void;
  color?: string; min?: number; max?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const n = parseInt(draft);
    if (!isNaN(n)) onUpdate(field, Math.min(max, Math.max(min, n)));
    setEditing(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 52 }}>
      <span style={{ fontSize: 9, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "serif" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <NudgeButton onClick={() => onUpdate(field, Math.max(min, value - 1))}><Minus size={10} /></NudgeButton>
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
            style={{
              width: 38, textAlign: "center", background: "rgba(196,169,107,0.1)",
              border: `1px solid ${color}`, borderRadius: 4, color,
              fontSize: 16, fontWeight: 700, fontFamily: "serif", padding: "1px 2px",
              outline: "none",
            }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{
              width: 38, textAlign: "center", color, fontSize: 16,
              fontWeight: 700, fontFamily: "serif", cursor: "text",
              background: "rgba(255,255,255,0.03)", borderRadius: 4,
              border: "1px solid transparent", padding: "1px 2px",
              transition: "border 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(196,169,107,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
          >
            {value}
          </span>
        )}
        <NudgeButton onClick={() => onUpdate(field, Math.min(max, value + 1))}><Plus size={10} /></NudgeButton>
      </div>
    </div>
  );
}

// ─── HP Bar ─────────────────────────────────────────────────────────────────

function HpBar({ hp, maxHp, tempHp }: { hp: number; maxHp: number; tempHp: number }) {
  const pct = maxHp > 0 ? Math.min(100, (hp / maxHp) * 100) : 0;
  const tempPct = maxHp > 0 ? Math.min(100 - pct, (tempHp / maxHp) * 100) : 0;
  const color = pct > 60 ? "#22c55e" : pct > 30 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.3s, background 0.3s" }} />
      {tempHp > 0 && (
        <div style={{ position: "absolute", left: `${pct}%`, height: "100%", width: `${tempPct}%`, background: "#60a5fa", borderRadius: 3 }} />
      )}
    </div>
  );
}

// ─── Ability score modifier display ─────────────────────────────────────────

function AbilityScore({ label, value, field, characterId, onUpdate }: {
  label: string; value: number; field: string; characterId: string;
  onUpdate: (field: string, value: number) => void;
}) {
  const mod = Math.floor((value - 10) / 2);
  const modStr = mod >= 0 ? `+${mod}` : String(mod);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 6, padding: "6px 4px", gap: 2, minWidth: 58,
    }}>
      <span style={{ fontSize: 8, color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif" }}>{label}</span>
      <span style={{ fontSize: 11, color: "#c4a96b", fontWeight: 700 }}>{modStr}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <NudgeButton onClick={() => onUpdate(field, Math.max(1, value - 1))}><Minus size={9} /></NudgeButton>
        <span style={{ fontSize: 14, color: "#e5e0d5", fontWeight: 700, fontFamily: "serif", minWidth: 20, textAlign: "center" }}>{value}</span>
        <NudgeButton onClick={() => onUpdate(field, Math.min(30, value + 1))}><Plus size={9} /></NudgeButton>
      </div>
    </div>
  );
}

// ─── Death saves ─────────────────────────────────────────────────────────────

function DeathSaves({ success, failure, characterId, onUpdate }: {
  success: number; failure: number; characterId: string;
  onUpdate: (field: string, value: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 9, color: "#22c55e", letterSpacing: "0.08em", textTransform: "uppercase" }}>Successes</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[0,1,2].map(i => (
            <button
              key={i}
              onClick={() => onUpdate("death_saves_success", success === i + 1 ? i : i + 1)}
              style={{
                width: 16, height: 16, borderRadius: "50%",
                background: i < success ? "#22c55e" : "rgba(255,255,255,0.06)",
                border: `2px solid ${i < success ? "#22c55e" : "rgba(255,255,255,0.15)"}`,
                cursor: "pointer", padding: 0, transition: "all 0.15s",
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 9, color: "#ef4444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Failures</span>
        <div style={{ display: "flex", gap: 4 }}>
          {[0,1,2].map(i => (
            <button
              key={i}
              onClick={() => onUpdate("death_saves_failure", failure === i + 1 ? i : i + 1)}
              style={{
                width: 16, height: 16, borderRadius: "50%",
                background: i < failure ? "#ef4444" : "rgba(255,255,255,0.06)",
                border: `2px solid ${i < failure ? "#ef4444" : "rgba(255,255,255,0.15)"}`,
                cursor: "pointer", padding: 0, transition: "all 0.15s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Conditions picker ───────────────────────────────────────────────────────

function ConditionsPicker({ conditions, characterId, onUpdate }: {
  conditions: string[]; characterId: string;
  onUpdate: (field: string, value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (cond: string) => {
    const next = conditions.includes(cond)
      ? conditions.filter(c => c !== cond)
      : [...conditions, cond];
    onUpdate("conditions", next);
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: conditions.length ? 6 : 0 }}>
        {conditions.map(c => (
          <span
            key={c}
            onClick={() => toggle(c)}
            style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 10,
              background: `${CONDITION_COLORS[c] || "#6b7280"}22`,
              border: `1px solid ${CONDITION_COLORS[c] || "#6b7280"}`,
              color: CONDITION_COLORS[c] || "#9ca3af",
              cursor: "pointer", fontFamily: "serif",
            }}
          >
            {c} ×
          </span>
        ))}
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontSize: 11, color: "#6b7280", background: "none", border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: 4, padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
        }}
      >
        <Plus size={11} /> Add condition
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
              {CONDITIONS.filter(c => !conditions.includes(c)).map(c => (
                <span
                  key={c}
                  onClick={() => { toggle(c); setOpen(false); }}
                  style={{
                    fontSize: 10, padding: "2px 7px", borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#9ca3af", cursor: "pointer",
                    transition: "all 0.15s", fontFamily: "serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${CONDITION_COLORS[c] || "#6b7280"}22`;
                    e.currentTarget.style.borderColor = CONDITION_COLORS[c] || "#6b7280";
                    e.currentTarget.style.color = CONDITION_COLORS[c] || "#9ca3af";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "#9ca3af";
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Notes field ─────────────────────────────────────────────────────────────

function NotesField({ value, characterId, onUpdate }: {
  value: string; characterId: string;
  onUpdate: (field: string, value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const save = () => { onUpdate("notes", draft); setDirty(false); };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={draft}
        onChange={e => { setDraft(e.target.value); setDirty(true); }}
        onBlur={save}
        placeholder="DM notes, quest hooks, secrets…"
        rows={3}
        style={{
          width: "100%", resize: "vertical", background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
          color: "#c4b99a", fontSize: 12, fontFamily: "serif",
          padding: "8px 10px", outline: "none", boxSizing: "border-box",
          transition: "border 0.15s",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(196,169,107,0.4)")}
      />
      {dirty && (
        <span style={{ position: "absolute", bottom: 8, right: 8, fontSize: 10, color: "#f59e0b" }}>
          unsaved
        </span>
      )}
    </div>
  );
}

// ─── Single player card ──────────────────────────────────────────────────────

function PlayerCard({ character, onUpdate }: {
  character: Character;
  onUpdate: (id: string, field: string, value: unknown) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const update = (field: string, value: unknown) => onUpdate(character.id, field, value);
  const hpPct = character.max_hp > 0 ? Math.round((character.hp / character.max_hp) * 100) : 0;
  const isDowned = character.hp <= 0;

  return (
    <motion.div
      layout
      style={{
        background: isDowned
          ? "linear-gradient(135deg, rgba(127,29,29,0.15) 0%, rgba(17,14,11,0.9) 100%)"
          : "linear-gradient(135deg, rgba(30,24,16,0.95) 0%, rgba(17,14,11,0.9) 100%)",
        border: isDowned ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(196,169,107,0.15)",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px", cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Portrait */}
        <div style={{
          width: 48, height: 48, borderRadius: 8, overflow: "hidden", flexShrink: 0,
          border: "1px solid rgba(196,169,107,0.25)",
          background: "rgba(0,0,0,0.4)",
        }}>
          <img
            src={character.portrait_url ? `${character.portrait_url.split("?")[0]}?t=${Date.now()}` : "/images/maleunlock.png"}
            alt={character.character_name}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
          />
        </div>

        {/* Name + class */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e5e0d5", fontFamily: "serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {character.character_name}
            </span>
            {character.inspiration && (
              <Sparkles size={12} color="#f59e0b" />
            )}
            {isDowned && <Skull size={12} color="#ef4444" />}
          </div>
          <div style={{ fontSize: 11, color: "#8b7355" }}>
            {character.race} {character.class} • Lvl {character.level}
          </div>
          <div style={{ marginTop: 5 }}>
            <HpBar hp={character.hp} maxHp={character.max_hp} tempHp={character.temp_hp} />
            <span style={{ fontSize: 10, color: "#6b7280", marginTop: 2, display: "block" }}>
              {character.hp}/{character.max_hp} HP
              {character.temp_hp > 0 && <span style={{ color: "#60a5fa" }}> +{character.temp_hp} temp</span>}
              {" "}• {hpPct}%
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <Shield size={12} color="#60a5fa" style={{ margin: "0 auto 2px" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", fontFamily: "serif" }}>{character.ac}</span>
            <div style={{ fontSize: 9, color: "#6b7280" }}>AC</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <Zap size={12} color="#a78bfa" style={{ margin: "0 auto 2px" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", fontFamily: "serif" }}>{character.mana}/{character.max_mana}</span>
            <div style={{ fontSize: 9, color: "#6b7280" }}>Mana</div>
          </div>
        </div>

        {/* Conditions preview */}
        {character.conditions?.length > 0 && (
          <div style={{ display: "flex", gap: 3, flexShrink: 0, maxWidth: 80, flexWrap: "wrap" }}>
            {character.conditions.slice(0, 3).map(c => (
              <span key={c} title={c} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: CONDITION_COLORS[c] || "#6b7280",
                display: "inline-block",
                }} />
            ))}
            {character.conditions.length > 3 && <span style={{ fontSize: 9, color: "#6b7280" }}>+{character.conditions.length - 3}</span>}
          </div>
        )}

        <div style={{ color: "#6b7280", flexShrink: 0 }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded editor */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              borderTop: "1px solid rgba(196,169,107,0.1)",
              padding: "14px",
              display: "flex", flexDirection: "column", gap: 16,
            }}>

              {/* HP / Mana / Temp HP row */}
              <div>
                <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 8 }}>
                  ⚔ Vitals
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <StatField label="HP" value={character.hp} field="hp" characterId={character.id} onUpdate={update} color="#22c55e" max={character.max_hp + 50} />
                  <StatField label="Max HP" value={character.max_hp} field="max_hp" characterId={character.id} onUpdate={update} color="#16a34a" />
                  <StatField label="Temp HP" value={character.temp_hp} field="temp_hp" characterId={character.id} onUpdate={update} color="#60a5fa" />
                  <StatField label="Mana" value={character.mana} field="mana" characterId={character.id} onUpdate={update} color="#a78bfa" max={character.max_mana + 50} />
                  <StatField label="Max Mana" value={character.max_mana} field="max_mana" characterId={character.id} onUpdate={update} color="#7c3aed" />
                </div>
              </div>

              {/* Combat stats */}
              <div>
                <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 8 }}>
                  🛡 Combat
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <StatField label="AC" value={character.ac} field="ac" characterId={character.id} onUpdate={update} color="#60a5fa" />
                  <StatField label="Init +" value={character.initiative_bonus} field="initiative_bonus" characterId={character.id} onUpdate={update} color="#34d399" min={-5} max={20} />
                  <StatField label="Speed" value={character.speed} field="speed" characterId={character.id} onUpdate={update} color="#fbbf24" />
                  <StatField label="Prof +" value={character.proficiency_bonus} field="proficiency_bonus" characterId={character.id} onUpdate={update} color="#f59e0b" />
                  <StatField label="Level" value={character.level} field="level" characterId={character.id} onUpdate={update} color="#c4a96b" min={1} max={20} />
                  <StatField label="EXP" value={character.exp} field="exp" characterId={character.id} onUpdate={update} color="#c4a96b" max={999999} />
                </div>
              </div>

              {/* Ability scores */}
              <div>
                <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 8 }}>
                  ✦ Ability Scores
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { label: "STR", field: "strength" },
                    { label: "DEX", field: "dexterity" },
                    { label: "CON", field: "constitution" },
                    { label: "INT", field: "intelligence" },
                    { label: "WIS", field: "wisdom" },
                    { label: "CHA", field: "charisma" },
                  ].map(a => (
                    <AbilityScore
                      key={a.field}
                      label={a.label}
                      value={(character as unknown as Record<string, number>)[a.field]}
                      field={a.field}
                      characterId={character.id}
                      onUpdate={update}
                    />
                  ))}
                </div>
              </div>

              {/* Inspiration + Death saves */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 6 }}>
                    ✦ Inspiration
                  </div>
                  <button
                    onClick={() => update("inspiration", !character.inspiration)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                      background: character.inspiration ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)",
                      border: character.inspiration ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                      color: character.inspiration ? "#f59e0b" : "#6b7280",
                      fontSize: 12, fontFamily: "serif", transition: "all 0.2s",
                    }}
                  >
                    <Sparkles size={13} />
                    {character.inspiration ? "Inspired!" : "Grant Inspiration"}
                  </button>
                </div>

                {character.hp <= 0 && (
                  <div>
                    <div style={{ fontSize: 10, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 6 }}>
                      💀 Death Saves
                    </div>
                    <DeathSaves
                      success={character.death_saves_success}
                      failure={character.death_saves_failure}
                      characterId={character.id}
                      onUpdate={update}
                    />
                  </div>
                )}
              </div>

              {/* Conditions */}
              <div>
                <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 8 }}>
                  ⚗ Conditions & Status
                </div>
                <ConditionsPicker
                  conditions={character.conditions || []}
                  characterId={character.id}
                  onUpdate={update}
                />
              </div>

              {/* Notes */}
              <div>
                <div style={{ fontSize: 10, color: "#8b7355", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "serif", marginBottom: 6 }}>
                  📜 DM Notes
                </div>
                <NotesField value={character.notes || ""} characterId={character.id} onUpdate={update} />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main DM Players Panel ───────────────────────────────────────────────────

export function DMPlayersPanel() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase
        .from("characters")
        .select("*, profiles(username)")
        .order("character_name");

      if (!error && data) setCharacters(data as Character[]);
      setLoading(false);
    };

    fetchCharacters();

    // Realtime subscription
    const channel = supabase
      .channel("dm-panel-characters")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "characters" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setCharacters(prev =>
              prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } : c)
            );
          } else if (payload.eventType === "INSERT") {
            fetchCharacters();
          } else if (payload.eventType === "DELETE") {
            setCharacters(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Optimistic update + Supabase write
  const handleUpdate = async (characterId: string, field: string, value: unknown) => {
    // Optimistic
    setCharacters(prev =>
      prev.map(c => c.id === characterId ? { ...c, [field]: value } : c)
    );

    // Persist
    const { error } = await supabase
      .from("characters")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", characterId);

    if (error) {
      console.error("Failed to update character:", error);
      // Revert on error — re-fetch
      const { data } = await supabase.from("characters").select("*, profiles(username)").order("character_name");
      if (data) setCharacters(data as Character[]);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#8b7355", fontFamily: "serif", letterSpacing: "0.1em" }}>
        <Activity size={20} style={{ marginRight: 10 }} />
        Summoning adventurers…
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 60, color: "#6b7280", fontFamily: "serif" }}>
        <Skull size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
        <p>No adventurers have registered yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "4px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c4a96b", fontFamily: "serif", margin: 0 }}>
            DM Panel — Party Overview
          </h2>
          <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0", fontFamily: "serif" }}>
            {characters.length} adventurer{characters.length !== 1 ? "s" : ""} • Live sync enabled
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: 10, color: "#22c55e", fontFamily: "serif" }}>Live</span>
        </div>
      </div>

      {/* Player cards */}
      {characters.map(c => (
        <PlayerCard key={c.id} character={c} onUpdate={handleUpdate} />
      ))}
    </div>
  );
}