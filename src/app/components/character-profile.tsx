import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useAuth } from "./auth-provider";
import Cropper from "react-easy-crop";

// ── Constants ────────────────────────────────────────────────────────────────
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
  "Blood Hunter": ["Order of the Ghostslayer", "Order of the Profane Soul", "Order of the Mutant", "Order of the Lycan"],
};

const SPELLCASTING_CLASSES = ["Sorcerer", "Druid", "Wizard", "Warlock", "Bard", "Paladin", "Ranger", "Cleric"];
const SPELLCASTING_ABILITY: Record<string, string> = {
  Sorcerer: "charisma", Bard: "charisma", Warlock: "charisma", Paladin: "charisma",
  Wizard: "intelligence", Cleric: "wisdom", Druid: "wisdom", Ranger: "wisdom",
};
const HIT_DICE: Record<string, number> = {
  Barbarian: 12, Fighter: 10, Paladin: 10, Ranger: 10,
  Bard: 8, Cleric: 8, Druid: 8, Monk: 8, Rogue: 8, Warlock: 8, "Blood Hunter": 10,
  Sorcerer: 6, Wizard: 6,
};
const BASE_SPEED: Record<string, number> = {
  Dwarf: 25, Halfling: 25,
};

const ELEMENTS = ["Ignis", "Marea", "Fulmen", "Aero", "Glacis", "Terrus", "Virael", "Spectra"];
const ELEMENT_COLORS: Record<string, string> = {
  Ignis: "#f97316", Marea: "#38bdf8", Fulmen: "#fbbf24", Aero: "#a3e635",
  Glacis: "#93c5fd", Terrus: "#a16207", Virael: "#4ade80", Spectra: "#c084fc",
};

const ALIGNMENTS = ["Lawful Good", "Neutral Good", "Chaotic Good", "Lawful Neutral", "True Neutral", "Chaotic Neutral", "Lawful Evil", "Neutral Evil", "Chaotic Evil"];
const BACKGROUNDS = ["Acolyte", "Charlatan", "Criminal", "Entertainer", "Folk Hero", "Guild Artisan", "Hermit", "Noble", "Outlander", "Sage", "Sailor", "Soldier", "Urchin"];

const SKILLS = [
  { name: "Acrobatics",     ability: "dexterity" },
  { name: "Animal Handling",ability: "wisdom" },
  { name: "Arcana",         ability: "intelligence" },
  { name: "Athletics",      ability: "strength" },
  { name: "Deception",      ability: "charisma" },
  { name: "History",        ability: "intelligence" },
  { name: "Insight",        ability: "wisdom" },
  { name: "Intimidation",   ability: "charisma" },
  { name: "Investigation",  ability: "intelligence" },
  { name: "Medicine",       ability: "wisdom" },
  { name: "Nature",         ability: "intelligence" },
  { name: "Perception",     ability: "wisdom" },
  { name: "Performance",    ability: "charisma" },
  { name: "Persuasion",     ability: "charisma" },
  { name: "Religion",       ability: "intelligence" },
  { name: "Sleight of Hand",ability: "dexterity" },
  { name: "Stealth",        ability: "dexterity" },
  { name: "Survival",       ability: "wisdom" },
];

const SAVING_THROWS = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

// ── D&D helpers ──────────────────────────────────────────────────────────────
const mod = (score: number) => Math.floor((score - 10) / 2);
const signedMod = (score: number) => { const m = mod(score); return (m >= 0 ? "+" : "") + m; };
const pb = (level: number) => level <= 4 ? 2 : level <= 8 ? 3 : level <= 12 ? 4 : level <= 16 ? 5 : 6;

function calcMaxHp(cls: string, conScore: number, level: number): number {
  const die = HIT_DICE[cls] ?? 8;
  const conMod = mod(conScore);
  const avg = Math.floor(die / 2) + 1;
  return Math.max(1, die + conMod) + (level - 1) * Math.max(1, avg + conMod);
}

function calcAC(cls: string, dex: number, con: number, wis: number): number {
  if (cls === "Barbarian") return 10 + mod(dex) + mod(con);
  if (cls === "Monk")      return 10 + mod(dex) + mod(wis);
  return 10 + mod(dex);
}

function calcSpeed(race: string): number {
  return BASE_SPEED[race] ?? 30;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Attack {
  weapon: string;
  attack_bonus: string;
  damage: string;
  damage_type: string;
  range: string;
}

interface Spell {
  name: string;
  mana_cost: number;
  is_cantrip: boolean;
}

interface Character {
  id?: string; player_id?: string;
  // Identity
  character_name: string; player_name: string; class: string; subclass: string;
  race: string; subrace: string; element: string; background: string;
  alignment: string; age: string; gender: string; height: string; weight: string;
  portrait_url: string;
  // Lore
  backstory: string; quote: string;
  // Ability scores
  strength: number; dexterity: number; constitution: number;
  intelligence: number; wisdom: number; charisma: number;
  // DM-set
  level: number; exp: number; hp: number; max_hp: number;
  mana: number; max_mana: number;
  // Proficiencies (arrays of names)
  skill_proficiencies: string[];
  save_proficiencies: string[];
  // Spellcasting
  spellcasting_ability: string;
  spells_known: string[];
  spell_slots: Record<string, number>;
  // Equipment & features
  equipment: string[];
  features: string[];
  // Attacks (stored as JSON string)
  attacks_json: string;
  // Derived (stored for DM panel access)
  ac: number; initiative_bonus: number; proficiency_bonus: number;
  passive_perception: number; speed: number; hit_dice: string;
  gold: number; silver: number; copper: number;
  spell_slots_used: Record<string, number>;
  temp_hp: number; death_saves_success: number; death_saves_failure: number;
}

const defaultChar: Character = {
  character_name: "", player_name: "", class: "", subclass: "",
  race: "", subrace: "", element: "", background: "", alignment: "",
  age: "", gender: "", height: "", weight: "", portrait_url: "",
  backstory: "", quote: "",
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
  level: 1, exp: 0, hp: 8, max_hp: 8, mana: 0, max_mana: 10, temp_hp: 0,
  skill_proficiencies: [], save_proficiencies: [],
  spellcasting_ability: "", spells_known: [], spell_slots: {},
  equipment: [], features: [],
  attacks_json: "[]",
  ac: 10, initiative_bonus: 0, proficiency_bonus: 2,
  passive_perception: 10, speed: 30, hit_dice: "1d8",
  gold: 0, silver: 0, copper: 0, spell_slots_used: {},
  death_saves_success: 0, death_saves_failure: 0,
};

// ── Styles ───────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 14px",
  background: "rgba(6,8,15,0.8)", border: "1px solid rgba(212,175,55,0.2)",
  color: "#e8d9b5", fontFamily: "'Crimson Pro', serif",
  fontSize: "1rem", outline: "none", boxSizing: "border-box" as const,
};
const labelStyle = {
  fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "0.18em",
  color: "rgba(212,175,55,0.6)", textTransform: "uppercase" as const,
  display: "block", marginBottom: 6,
};
const readonlyBox = (value: string | number, label: string, color: string, note?: string) => (
  <div style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: `1px solid ${color}22` }}>
    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.35)", textTransform: "uppercase", marginBottom: 2 }}>{label}</p>
    {note && <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", color: "rgba(212,175,55,0.2)", marginBottom: 4 }}>{note}</p>}
    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "1.1rem", color, fontWeight: 700 }}>{value}</p>
  </div>
);
const SectionTitle = ({ title }: { title: string }) => (
  <div style={{ marginBottom: 16, marginTop: 24 }}>
    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#d4af37", textTransform: "uppercase" }}>{title}</p>
    <div style={{ height: 1, background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)", marginTop: 6 }} />
  </div>
);

// ── Crop helpers ─────────────────────────────────────────────────────────────
interface CropArea { x: number; y: number; width: number; height: number; }
async function getCroppedBlob(imageSrc: string, cropArea: CropArea): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cropArea.width; canvas.height = cropArea.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);
      canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("toBlob failed")); }, "image/jpeg", 0.92);
    };
    img.onerror = reject;
  });
}

function CropModal({ imageSrc, onConfirm, onCancel }: { imageSrc: string; onConfirm: (b: Blob) => void; onCancel: () => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const onCropComplete = useCallback((_: unknown, p: CropArea) => setCroppedAreaPixels(p), []);
  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    onConfirm(await getCroppedBlob(imageSrc, croppedAreaPixels));
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, background: "linear-gradient(135deg,#09101f,#0d1526)", border: "1px solid rgba(212,175,55,0.3)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#d4af37", textTransform: "uppercase" }}>Crop Portrait</p>
          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.85rem", color: "rgba(232,217,181,0.4)", marginTop: 4 }}>Drag to reposition · Scroll to zoom</p>
        </div>
        <div style={{ position: "relative", width: "100%", height: 360, background: "#000" }}>
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1}
            onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
            style={{ containerStyle: { background: "#000" }, cropAreaStyle: { border: "2px solid #d4af37", boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" } }} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Zoom</p>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ width: "100%", accentColor: "#d4af37", cursor: "pointer" }} />
        </div>
        <div style={{ display: "flex", gap: 12, padding: "0 24px 24px" }}>
          <motion.button onClick={onCancel} whileTap={{ scale: 0.97 }} style={{ flex: 1, padding: "10px 0", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(232,217,181,0.5)", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Cancel</motion.button>
          <motion.button onClick={handleConfirm} whileTap={{ scale: 0.97 }} style={{ flex: 2, padding: "10px 0", background: "transparent", border: "1px solid rgba(212,175,55,0.5)", color: "#d4af37", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Confirm Crop</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function CharacterProfile() {
  const { user } = useAuth();
  const [character, setCharacter] = useState<Character>(defaultChar);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  // Attacks local state
  const [attacks, setAttacks] = useState<Attack[]>([]);
  // Spells / equipment / features as textarea strings for easy editing
  const [spellsText, setSpellsText] = useState("");
  const [equipText, setEquipText] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [spells, setSpells] = useState<Spell[]>([]);
  const [spellSheetChar, setSpellSheetChar] = useState<any | null>(null);

  useEffect(() => {
  console.log("CharacterProfile mounted");
  return () => console.log("CharacterProfile UNMOUNTED");
}, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("characters").select("*").eq("player_id", user.id).single();
      if (data) {
        setCharacter({ ...defaultChar, ...data });
        setExists(true);
        try { setAttacks(JSON.parse(data.attacks_json || "[]")); } catch { setAttacks([]); }
        setSpellsText((data.spells_known || []).join("\n"));
        setEquipText((data.equipment || []).join("\n"));
        setFeaturesText((data.features || []).join("\n"));
        setSpells(data.spells_v2 || []);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  const recalcDerived = (c: Character): Character => {
    const profBonus = pb(c.level);
    const dexMod = mod(c.dexterity);
    const wisMod = mod(c.wisdom);
    const perceptionProf = c.skill_proficiencies.includes("Perception") ? profBonus : 0;
    const die = HIT_DICE[c.class] ?? 8;
    return {
      ...c,
      proficiency_bonus: profBonus,
      max_hp: c.class ? calcMaxHp(c.class, c.constitution, c.level) : c.max_hp,
      passive_perception: 10 + wisMod + perceptionProf,
      speed: calcSpeed(c.race),
      hit_dice: `${c.level}d${die}`,
      spellcasting_ability: SPELLCASTING_ABILITY[c.class] || c.spellcasting_ability,
    };
  };

  const set = (field: keyof Character, value: string | number | string[]) => {
    setCharacter((prev) => {
      const next = { ...prev, [field]: value, ...(field === "class" ? { subclass: "" } : {}) };
      return recalcDerived(next);
    });
  };

  const toggleArrayItem = (field: "skill_proficiencies" | "save_proficiencies", item: string) => {
    setCharacter((prev) => {
      const arr = prev[field] as string[];
      const next = { ...prev, [field]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] };
      return recalcDerived(next);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please upload an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("Image must be under 10MB."); return; }
    setUploadError("");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!user) return;
    setCropSrc(null);
    setUploading(true);
    setUploadError("");
    const path = `${user.id}/portrait.jpg`;
    const { error } = await supabase.storage.from("portraits").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) { setUploadError("Upload failed. Try again."); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("portraits").getPublicUrl(path);
    set("portrait_url", `${urlData.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  };

  const addAttack = () => setAttacks((a) => [...a, { weapon: "", attack_bonus: "", damage: "", damage_type: "", range: "" }]);
  const removeAttack = (i: number) => setAttacks((a) => a.filter((_, idx) => idx !== i));
  const setAttack = (i: number, field: keyof Attack, val: string) => setAttacks((a) => a.map((atk, idx) => idx === i ? { ...atk, [field]: val } : atk));

  const save = async () => {
  if (!user) return;
  setSaving(true);
  const derived = recalcDerived(character);
  if (derived.hp === 0 || derived.hp === defaultChar.hp) {
    derived.hp = derived.max_hp;
  }
  const payload = {
    ...derived,
    player_id: user.id,
    attacks_json: JSON.stringify(attacks),
    spells_known: spellsText.split("\n").map((s) => s.trim()).filter(Boolean),
    equipment: equipText.split("\n").map((s) => s.trim()).filter(Boolean),
    features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    spells_v2: spells,
  };
  if (exists) { await supabase.from("characters").update(payload).eq("player_id", user.id); }
  else { await supabase.from("characters").insert(payload); setExists(true); }
  setSaving(false); setSaved(true);
  setTimeout(() => setSaved(false), 2500);
};

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(212,175,55,0.4)", fontSize: "0.7rem", letterSpacing: "0.2em" }}>Loading...</p>
    </div>
  );

  const subclasses = CLASSES[character.class] ?? [];
  const isSpellcaster = SPELLCASTING_CLASSES.includes(character.class);
  const profBonus = pb(character.level);
  const spellAbilityScore = character[character.spellcasting_ability as keyof Character] as number || 10;
  const spellSaveDC = 8 + profBonus + mod(spellAbilityScore);
  const spellAttackBonus = profBonus + mod(spellAbilityScore);

  return (
    <>
      <AnimatePresence>
        {cropSrc && <CropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />}
      </AnimatePresence>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* ── Portrait ── */}
        <SectionTitle title="Portrait" />
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
          <div style={{ width: 100, height: 100, flexShrink: 0, border: "1px solid rgba(212,175,55,0.2)", background: "rgba(6,8,15,0.8)", overflow: "hidden", position: "relative" }}>
            {character.portrait_url
              ? <img src={character.portrait_url} alt="Portrait" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: "2rem", opacity: 0.2 }}>⚔</span></div>
            }
            {uploading && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.45rem", color: "#d4af37", letterSpacing: "0.1em" }}>UPLOADING...</p></div>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "inline-block", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "10px 20px", border: "1px solid rgba(212,175,55,0.3)", color: uploading ? "rgba(212,175,55,0.3)" : "#d4af37", background: "transparent", cursor: uploading ? "not-allowed" : "pointer" }}>
              {uploading ? "Uploading..." : character.portrait_url ? "Change Portrait" : "Upload Portrait"}
              <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} style={{ display: "none" }} />
            </label>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.8rem", color: uploadError ? "#f87171" : "rgba(232,217,181,0.3)", marginTop: 8 }}>
              {uploadError || "JPG, PNG, or WEBP · Max 10MB · Crop after selecting"}
            </p>
          </div>
        </div>

        {/* ── Identity ── */}
        <SectionTitle title="Identity" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { label: "Character Name", field: "character_name", placeholder: "Your character's name" },
            { label: "Player Name", field: "player_name", placeholder: "Your real name" },
            { label: "Race", field: "race", placeholder: "e.g. Human, Elf, Tiefling" },
            { label: "Subrace", field: "subrace", placeholder: "e.g. High Elf, Wood Elf" },
            { label: "Background", field: "background", placeholder: "" },
            { label: "Alignment", field: "alignment", placeholder: "" },
            { label: "Age", field: "age", placeholder: "e.g. 24" },
            { label: "Gender", field: "gender", placeholder: "e.g. Male, Female, Non-binary" },
            { label: "Height", field: "height", placeholder: "e.g. 5'11\"" },
            { label: "Weight", field: "weight", placeholder: "e.g. 160 lbs" },
          ].map(({ label, field, placeholder }: { label: string; field: keyof Character; placeholder: string }) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              {field === "background" ? (
                <select style={{ ...inputStyle, cursor: "pointer" }} value={character[field] as string} onChange={(e) => set(field as keyof Character, e.target.value)}>
                  <option value="">Select background...</option>
                  {BACKGROUNDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : field === "alignment" ? (
                <select style={{ ...inputStyle, cursor: "pointer" }} value={character[field] as string} onChange={(e) => set(field as keyof Character, e.target.value)}>
                  <option value="">Select alignment...</option>
                  {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input style={inputStyle} placeholder={placeholder} value={character[field] as string}
                  onChange={(e) => set(field as keyof Character, e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {/* Class / Subclass */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Class</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={character.class} onChange={(e) => set("class", e.target.value)}>
              <option value="">Select class...</option>
              {Object.keys(CLASSES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Subclass</label>
            <select style={{ ...inputStyle, cursor: character.level >= 3 && subclasses.length ? "pointer" : "not-allowed", opacity: character.level >= 3 && subclasses.length ? 1 : 0.4 }}
              value={character.subclass} onChange={(e) => set("subclass", e.target.value)} disabled={!subclasses.length || character.level < 3}>
              <option value="">{character.level < 3 ? `Unlocks at Level 3 (currently ${character.level})` : "Select subclass..."}</option>
              {subclasses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Element */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Element</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ELEMENTS.map((el) => (
              <button key={el} onClick={() => set("element", el)} style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.1em", padding: "8px 16px", cursor: "pointer", background: character.element === el ? `${ELEMENT_COLORS[el]}22` : "transparent", border: `1px solid ${character.element === el ? ELEMENT_COLORS[el] : "rgba(212,175,55,0.2)"}`, color: character.element === el ? ELEMENT_COLORS[el] : "rgba(232,217,181,0.5)", transition: "all 0.2s ease" }}>{el}</button>
            ))}
          </div>
        </div>

        {/* ── Ability Scores ── */}
        <SectionTitle title="Ability Scores" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {(["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"] as const).map((field) => {
            const colors: Record<string, string> = { strength: "#f97316", dexterity: "#facc15", constitution: "#4ade80", intelligence: "#38bdf8", wisdom: "#a78bfa", charisma: "#f472b6" };
            const color = colors[field];
            const score = character[field];
            return (
              <div key={field} style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: `1px solid ${color}22` }}>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 2 }}>{field}</p>
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", color: "rgba(212,175,55,0.3)", marginBottom: 6 }}>mod {signedMod(score)}</p>
                <input type="number" min={3} max={20} value={score} onChange={(e) => set(field, Number(e.target.value))}
                  style={{ ...inputStyle, padding: "6px 10px", fontSize: "1.1rem", fontWeight: 700, color }} />
              </div>
            );
          })}
        </div>

        {/* ── Derived Stats ── */}
        <SectionTitle title="Derived Stats (Auto-Calculated)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {readonlyBox(character.max_hp, "Max HP", "#f87171", `d${HIT_DICE[character.class] ?? 8} × Lvl ${character.level}`)}
          <div style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: "1px solid #60a5fa22" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.35)", textTransform: "uppercase", marginBottom: 2 }}>Armor Class</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", color: "rgba(96,165,250,0.4)", marginBottom: 6 }}>Set manually — include armor & modifiers</p>
            <input type="number" min={1} value={character.ac}
              onChange={(e) => set("ac", Number(e.target.value))}
              style={{ ...inputStyle, padding: "6px 10px", fontSize: "1.1rem", fontWeight: 700, color: "#60a5fa" }} />
          </div>

          <div style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: "1px solid #34d39922" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.45rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.35)", textTransform: "uppercase", marginBottom: 2 }}>Initiative Bonus</p>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.4rem", color: "rgba(52,211,153,0.4)", marginBottom: 6 }}>DEX auto-added on roll — add feats/items here</p>
            <input type="number" value={character.initiative_bonus}
              onChange={(e) => set("initiative_bonus", Number(e.target.value))}
              style={{ ...inputStyle, padding: "6px 10px", fontSize: "1.1rem", fontWeight: 700, color: "#34d399" }} />
          </div>

          {readonlyBox("+" + character.proficiency_bonus, "Prof. Bonus", "#fbbf24", `Level ${character.level}`)}
          {readonlyBox(character.passive_perception, "Passive Perc.", "#a78bfa", "10 + WIS + skill")}
          {readonlyBox(character.speed + " ft", "Speed", "#7ecac3", character.race || "base 30")}
          {readonlyBox(character.hit_dice, "Hit Dice", "#f97316")}
        </div>

        {/* ── Saving Throws ── */}
        <SectionTitle title="Saving Throws" />
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.35)", marginBottom: 12 }}>Check the saves your class is proficient in.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 24 }}>
          {SAVING_THROWS.map((ability) => {
            const isProficient = character.save_proficiencies.includes(ability);
            const total = mod(character[ability as keyof Character] as number) + (isProficient ? profBonus : 0);
            return (
              <div key={ability} onClick={() => toggleArrayItem("save_proficiencies", ability)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isProficient ? "rgba(212,175,55,0.08)" : "rgba(13,17,32,0.8)", border: `1px solid ${isProficient ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.1)"}`, cursor: "pointer", transition: "all 0.2s ease" }}>
                <div style={{ width: 14, height: 14, border: `1px solid ${isProficient ? "#d4af37" : "rgba(212,175,55,0.3)"}`, background: isProficient ? "#d4af3733" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isProficient && <span style={{ color: "#d4af37", fontSize: "0.6rem" }}>✓</span>}
                </div>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.1em", color: isProficient ? "#e8d9b5" : "rgba(232,217,181,0.5)", textTransform: "capitalize", flex: 1 }}>{ability}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.75rem", color: isProficient ? "#d4af37" : "rgba(232,217,181,0.4)" }}>{total >= 0 ? "+" : ""}{total}</span>
              </div>
            );
          })}
        </div>

        {/* ── Skills ── */}
        <SectionTitle title="Skills" />
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.35)", marginBottom: 12 }}>Check the skills your class/background grants proficiency in.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 24 }}>
          {SKILLS.map(({ name, ability }) => {
            const isProficient = character.skill_proficiencies.includes(name);
            const abilityScore = character[ability as keyof Character] as number;
            const total = mod(abilityScore) + (isProficient ? profBonus : 0);
            const abilityAbbr = ability.slice(0, 3).toUpperCase();
            return (
              <div key={name} onClick={() => toggleArrayItem("skill_proficiencies", name)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: isProficient ? "rgba(212,175,55,0.06)" : "rgba(13,17,32,0.6)", border: `1px solid ${isProficient ? "rgba(212,175,55,0.3)" : "rgba(212,175,55,0.08)"}`, cursor: "pointer", transition: "all 0.2s ease" }}>
                <div style={{ width: 12, height: 12, border: `1px solid ${isProficient ? "#d4af37" : "rgba(212,175,55,0.25)"}`, background: isProficient ? "#d4af3733" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isProficient && <span style={{ color: "#d4af37", fontSize: "0.55rem" }}>✓</span>}
                </div>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "0.06em", color: isProficient ? "#e8d9b5" : "rgba(232,217,181,0.45)", flex: 1 }}>{name}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", color: "rgba(212,175,55,0.3)" }}>{abilityAbbr}</span>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", color: isProficient ? "#d4af37" : "rgba(232,217,181,0.35)", minWidth: 24, textAlign: "right" }}>{total >= 0 ? "+" : ""}{total}</span>
              </div>
            );
          })}
        </div>

        {/* ── Attacks ── */}
        <SectionTitle title="Attacks" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {attacks.map((atk, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center" }}>
              {(["weapon", "attack_bonus", "damage", "damage_type", "range"] as const).map((field) => (
                <input key={field} style={{ ...inputStyle, padding: "8px 10px", fontSize: "0.85rem" }}
                  placeholder={field === "weapon" ? "Weapon" : field === "attack_bonus" ? "+hit" : field === "damage" ? "1d8+STR" : field === "damage_type" ? "Type" : "Range"}
                  value={atk[field]} onChange={(e) => setAttack(i, field, e.target.value)} />
              ))}
              <button onClick={() => removeAttack(i)} style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", padding: "8px", fontSize: "0.8rem" }}>✕</button>
            </div>
          ))}
        </div>
        <motion.button onClick={addAttack} whileHover={{ background: "rgba(212,175,55,0.08)" }} whileTap={{ scale: 0.97 }}
          style={{ padding: "8px 20px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(212,175,55,0.6)", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
          + Add Attack
        </motion.button>

        {/* ── Spellcasting ── */}
        {isSpellcaster && (
          <>
            <SectionTitle title="Spellcasting" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
              {readonlyBox(character.spellcasting_ability ? character.spellcasting_ability.toUpperCase().slice(0, 3) : "—", "Casting Ability", "#c084fc")}
              {readonlyBox(spellSaveDC, "Spell Save DC", "#c084fc", "8 + PB + mod")}
              {readonlyBox("+" + spellAttackBonus, "Spell Attack", "#c084fc", "PB + mod")}
            </div>

            {/* Spell Editor */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.35)" }}>
                  Add your spells and set their mana cost.
                </p>
                <button onClick={() => setSpells(s => [...s, { name: "", mana_cost: 2, is_cantrip: false }])}
                  style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(192,132,252,0.3)", color: "#c084fc", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  + Add Spell
                </button>
              </div>

              {spells.length === 0 && (
                <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.2)", textAlign: "center", padding: "20px 0" }}>
                  No spells added yet.
                </p>
              )}

              {/* Cantrips */}
              {spells.some(s => s.is_cantrip) && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(192,132,252,0.5)", textTransform: "uppercase", marginBottom: 8 }}>Cantrips — Free</p>
                  {spells.map((spell, i) => !spell.is_cantrip ? null : (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input
                        placeholder="Spell name"
                        value={spell.name}
                        onChange={e => setSpells(s => s.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                        style={{ ...inputStyle, flex: 1, padding: "8px 10px", fontSize: "0.85rem" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)", color: "#c084fc", fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                        ✦ CANTRIP
                      </div>
                      <button onClick={() => setSpells(s => s.map((x, idx) => idx === i ? { ...x, is_cantrip: false } : x))}
                        style={{ padding: "8px 10px", background: "transparent", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(212,175,55,0.4)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cinzel', serif" }}>
                        → Spell
                      </button>
                      <button onClick={() => setSpells(s => s.filter((_, idx) => idx !== i))}
                        style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", padding: "8px", fontSize: "0.8rem" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Leveled Spells */}
              {spells.some(s => !s.is_cantrip) && (
                <div>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: "rgba(192,132,252,0.5)", textTransform: "uppercase", marginBottom: 8 }}>Spells</p>
                  {spells.map((spell, i) => spell.is_cantrip ? null : (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                      <input
                        placeholder="Spell name"
                        value={spell.name}
                        onChange={e => setSpells(s => s.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                        style={{ ...inputStyle, flex: 1, padding: "8px 10px", fontSize: "0.85rem" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="number" min={1} max={13}
                          value={spell.mana_cost}
                          onChange={e => setSpells(s => s.map((x, idx) => idx === i ? { ...x, mana_cost: Number(e.target.value) } : x))}
                          style={{ ...inputStyle, width: 52, padding: "8px 6px", fontSize: "0.85rem", textAlign: "center", color: "#c084fc" }}
                        />
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.5rem", color: "rgba(192,132,252,0.5)", whiteSpace: "nowrap" }}>mana</span>
                      </div>
                      <button onClick={() => setSpells(s => s.map((x, idx) => idx === i ? { ...x, is_cantrip: true, mana_cost: 0 } : x))}
                        style={{ padding: "8px 10px", background: "transparent", border: "1px solid rgba(192,132,252,0.2)", color: "rgba(192,132,252,0.4)", cursor: "pointer", fontSize: "0.7rem", fontFamily: "'Cinzel', serif", whiteSpace: "nowrap" }}>
                        → Cantrip
                      </button>
                      <button onClick={() => setSpells(s => s.filter((_, idx) => idx !== i))}
                        style={{ background: "none", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", cursor: "pointer", padding: "8px", fontSize: "0.8rem" }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Equipment ── */}
        <SectionTitle title="Equipment" />
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Items (one per line)</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" as const }}
            placeholder={"Longsword\nLeather Armor\nExplorer's Pack\n50 gold pieces\n..."}
            value={equipText} onChange={(e) => setEquipText(e.target.value)} />
        </div>

        {/* ── Currency ── */}
        <SectionTitle title="Currency" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {([
            { field: "gold",   label: "Gold",   color: "#fbbf24" },
            { field: "silver", label: "Silver", color: "#94a3b8" },
            { field: "copper", label: "Copper", color: "#c2714f" },
          ] as const).map(({ field, label, color }) => (
            <div key={field} style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: `1px solid ${color}33` }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
              <input type="number" min={0} value={character[field]}
                onChange={(e) => set(field, Math.max(0, Number(e.target.value)))}
                style={{ ...inputStyle, padding: "6px 10px", fontSize: "1.1rem", fontWeight: 700, color }} />
            </div>
          ))}
        </div>

        {/* ── Features & Traits ── */}
        <SectionTitle title="Features & Traits" />
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Race/Class features, feats, boons (one per line)</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" as const }}
            placeholder={"Darkvision\nRage\nSecond Wind\nAction Surge\n..."}
            value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} />
        </div>

        {/* ── Lore ── */}
        <SectionTitle title="Lore" />
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Quote</label>
          <input style={inputStyle} placeholder={`"Something your character would say..."`} value={character.quote} onChange={(e) => set("quote", e.target.value)} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Backstory</label>
          <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" as const }}
            placeholder="Your character's history and motivations..."
            value={character.backstory} onChange={(e) => set("backstory", e.target.value)} />
        </div>

        {/* ── DM Stats (read-only display) ── */}
        <SectionTitle title="Stats (Set by DM)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          <div style={{ padding: "12px 14px", background: "rgba(13,17,32,0.8)", border: "1px solid rgba(248,113,113,0.15)", gridColumn: "span 3" }}>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.48rem", letterSpacing: "0.15em", color: "rgba(212,175,55,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Death Saves</p>
            <div style={{ display: "flex", gap: 24 }}>
              {([
                { label: "Successes", field: "death_saves_success" as const, color: "#4ade80" },
                { label: "Failures",  field: "death_saves_failure" as const, color: "#f87171" },
              ]).map(({ label, field, color }) => (
                <div key={field}>
                  <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.45rem", letterSpacing: "0.1em", color: "rgba(212,175,55,0.35)", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1,2,3].map((i) => (
                      <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${color}66`, background: i <= character[field] ? `${color}44` : "transparent" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
          {readonlyBox(character.hp, "Current HP", "#f87171")}
          {readonlyBox(character.temp_hp, "Temp HP", "#fbbf24")}
          {readonlyBox(character.max_hp, "Max HP", "#f87171")}
          {readonlyBox(character.mana, "Mana", "#818cf8")}
          {readonlyBox(character.max_mana, "Max Mana", "#818cf8")}
          {readonlyBox(character.level, "Level", "#d4af37")}
          {readonlyBox(character.exp, "EXP", "#d4af37")}
        </div>

        {/* ── Save Button ── */}
        <motion.button onClick={save} disabled={saving}
          whileHover={{ background: "rgba(212,175,55,0.12)" }} whileTap={{ scale: 0.98 }}
          style={{ width: "100%", padding: "14px 0", background: "transparent", border: "1px solid rgba(212,175,55,0.5)", color: saved ? "#4ade80" : "#d4af37", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.25s ease" }}>
          {saving ? "Saving..." : saved ? "✓ Saved" : exists ? "Update Character" : "Create Character"}
        </motion.button>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem", color: "rgba(232,217,181,0.3)", textAlign: "center", marginTop: 12 }}>
          Your DM will set your current HP, mana, level, and experience.
        </p>
      </div>
    </>
  );
}