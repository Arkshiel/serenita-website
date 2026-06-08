import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./auth-provider";

const CLASSES: Record<string, string[]> = {
  Sorcerer: ["Draconic Bloodline", "Wild Magic", "Divine Soul", "Shadow Magic", "Storm Sorcery"],
  Druid: ["Circle of the Moon", "Circle of Land", "Circle of Stars", "Circle of Spores"],
  Wizard: ["Abjuration", "Conjuration", "Divination", "Evocation", "Illusion", "Necromancy", "Transmutation"],
  Ranger: ["Beast Master", "Gloom Stalker", "Hunter", "Horizon Walker"],
  Fighter: ["Battle Master", "Champion", "Eldritch Knight", "Psi Warrior", "Rune Knight"],
  Barbarian: ["Berserker", "Totem Warrior", "Storm Herald", "Zealot", "Beast"],
  Warlock: ["Archfey", "Fiend", "Great Old One", "Celestial", "Hexblade"],
  Bard: ["College of Lore", "College of Valor", "College of Glamour", "College of Swords"],
  Paladin: ["Oath of Devotion", "Oath of Ancients", "Oath of Vengeance", "Oath of Glory"],
  Rogue: ["Thief", "Assassin", "Arcane Trickster", "Phantom", "Soulknife"],
  Cleric: ["Life", "Light", "War", "Trickery", "Knowledge", "Nature", "Tempest"],
};

const ELEMENTS = ["Ignis", "Marea", "Fulmen", "Aero", "Glacis", "Terrus", "Virael", "Spectra"];

const ELEMENT_COLORS: Record<string, string> = {
  Ignis: "#f97316",
  Marea: "#38bdf8",
  Fulmen: "#fbbf24",
  Aero: "#a3e635",
  Glacis: "#93c5fd",
  Terrus: "#a16207",
  Virael: "#4ade80",
  Spectra: "#c084fc",
};

interface Character {
  id?: string;
  player_id?: string;
  character_name: string;
  class: string;
  subclass: string;
  race: string;
  element: string;
  backstory: string;
  quote: string;
  hp: number;
  max_hp: number;
  mana: number;
  max_mana: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  level: number;
  exp: number;
}

const defaultChar: Character = {
  character_name: "", class: "", subclass: "", race: "", element: "",
  backstory: "", quote: "",
  hp: 20, max_hp: 20, mana: 10, max_mana: 10,
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
  level: 1, exp: 0,
};

const inputStyle = {
  width: "100%", padding: "10px 14px",
  background: "rgba(6,8,15,0.8)",
  border: "1px solid rgba(212,175,55,0.2)",
  color: "#e8d9b5",
  fontFamily: "'Crimson Pro', serif",
  fontSize: "1rem", outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  fontFamily: "'Cinzel', serif", fontSize: "0.55rem",
  letterSpacing: "0.18em", color: "rgba(212,175,55,0.6)",
  textTransform: "uppercase" as const, display: "block", marginBottom: 6,
};

const sectionTitle = (title: string) => (
  <div style={{ marginBottom: 16, marginTop: 8 }}>
    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#d4af37", textTransform: "uppercase" }}>{title}</p>
    <div style={{ height: 1, background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)", marginTop: 6 }} />
  </div>
);

export function CharacterProfile() {
  const { user, profile } = useAuth();
  const [character, setCharacter] = useState<Character>(defaultChar);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("characters")
        .select("*")
        .eq("player_id", user.id)
        .single();
      if (data) { setCharacter(data); setExists(true); }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const set = (field: keyof Character, value: string | number) => {
    setCharacter((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "class" ? { subclass: "" } : {}),
    }));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { ...character, player_id: user.id };
    if (exists) {
      await supabase.from("characters").update(payload).eq("player_id", user.id);
    } else {
      await supabase.from("characters").insert(payload);
      setExists(true);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(212,175,55,0.4)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>Loading...</p>
    </div>
  );

  const subclasses = CLASSES[character.class] ?? [];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {/* Identity */}
      {sectionTitle("Identity")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Character Name</label>
          <input style={inputStyle} placeholder="Your character's name" value={character.character_name}
            onChange={(e) => set("character_name", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Race</label>
          <input style={inputStyle} placeholder="e.g. Human, Elf, Tiefling" value={character.race}
            onChange={(e) => set("race", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Class</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={character.class}
            onChange={(e) => set("class", e.target.value)}>
            <option value="">Select class...</option>
            {Object.keys(CLASSES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
        <label style={labelStyle}>Subclass</label>
        <select
            style={{ ...inputStyle, cursor: character.level >= 3 && subclasses.length ? "pointer" : "not-allowed", opacity: character.level >= 3 && subclasses.length ? 1 : 0.4 }}
            value={character.subclass}
            onChange={(e) => set("subclass", e.target.value)}
            disabled={!subclasses.length || character.level < 3}
        >
            <option value="">
            {character.level < 3 ? `Unlocks at Level 3 (currently ${character.level})` : "Select subclass..."}
            </option>
            {subclasses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        </div>
      </div>

      {/* Element */}
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Element</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ELEMENTS.map((el) => (
            <button key={el} onClick={() => set("element", el)}
              style={{
                fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.1em",
                padding: "8px 16px", cursor: "pointer",
                background: character.element === el ? `${ELEMENT_COLORS[el]}22` : "transparent",
                border: `1px solid ${character.element === el ? ELEMENT_COLORS[el] : "rgba(212,175,55,0.2)"}`,
                color: character.element === el ? ELEMENT_COLORS[el] : "rgba(232,217,181,0.5)",
                transition: "all 0.2s ease",
              }}>
              {el}
            </button>
          ))}
        </div>
      </div>

      {/* Lore */}
      {sectionTitle("Lore")}
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Quote</label>
        <input style={inputStyle} placeholder={`"Something your character would say..."`} value={character.quote}
          onChange={(e) => set("quote", e.target.value)} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={labelStyle}>Backstory</label>
        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" as const }}
          placeholder="Your character's history and motivations..."
          value={character.backstory} onChange={(e) => set("backstory", e.target.value)} />
      </div>

      {/* Stats — read only for players, DM sets these */}
      {sectionTitle("Stats (Set by DM)")}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "HP", field: "hp" as keyof Character, color: "#f87171" },
          { label: "Max HP", field: "max_hp" as keyof Character, color: "#f87171" },
          { label: "Mana", field: "mana" as keyof Character, color: "#818cf8" },
          { label: "Max Mana", field: "max_mana" as keyof Character, color: "#818cf8" },
          { label: "Strength", field: "strength" as keyof Character, color: "#f97316" },
          { label: "Dexterity", field: "dexterity" as keyof Character, color: "#facc15" },
          { label: "Constitution", field: "constitution" as keyof Character, color: "#4ade80" },
          { label: "Intelligence", field: "intelligence" as keyof Character, color: "#38bdf8" },
          { label: "Wisdom", field: "wisdom" as keyof Character, color: "#a78bfa" },
          { label: "Charisma", field: "charisma" as keyof Character, color: "#f472b6" },
          { label: "Level", field: "level" as keyof Character, color: "#d4af37" },
          { label: "EXP", field: "exp" as keyof Character, color: "#d4af37" },
        ].map(({ label, field, color }) => (
          <div key={field} style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: `1px solid ${color}22` }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color, fontWeight: 700 }}>{character[field] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Save */}
      <motion.button onClick={save} disabled={saving}
        whileHover={{ background: "rgba(212,175,55,0.12)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: "100%", padding: "14px 0",
          background: "transparent", border: "1px solid rgba(212,175,55,0.5)",
          color: saved ? "#4ade80" : "#d4af37",
          fontFamily: "'Cinzel', serif", fontSize: "0.65rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          cursor: saving ? "not-allowed" : "pointer", transition: "all 0.25s ease",
        }}>
        {saving ? "Saving..." : saved ? "✓ Saved" : exists ? "Update Character" : "Create Character"}
      </motion.button>

      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.3)", textAlign: "center", marginTop: 12 }}>
        Your DM will set your HP, mana, and stats.
      </p>
    </div>
  );
}