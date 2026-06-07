import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin } from "lucide-react";

// ─── Nation Data ──────────────────────────────────────────────────────────────
const nations = [
  {
    id: "ignareth",
    name: "Ignareth",
    subtitle: "The Ember Throne",
    ruler: "The Eternal Pyre",
    element: "Fire",
    elementColor: "#f97316",
    description:
      "A smoldering realm of ash and molten rivers where the Ember Throne has burned without pause for a thousand years. The people of Ignareth are forged in fire — fierce, unyielding, and proud beyond measure. Volcanoes crown every horizon, and the capital city glows like a ember against the dark.",
    lore: "It is said the first king of Ignareth made a pact with a primordial flame spirit, binding his bloodline to the fire eternal. To rule here is to never know cold.",
    // Position as % of image width/height
    x: 6,
    y: 20,
    width: 16,
    height: 22,
    image: "/images/ignareth.jpg",
  },
  {
    id: "velmoor",
    name: "Velmoor",
    subtitle: "The Sunken Court",
    ruler: "The Hollow Queen",
    element: "Shadow",
    elementColor: "#a855f7",
    description:
      "Velmoor's towers sink into the earth as much as they rise above it — a labyrinthine court of underground canals, submerged archives, and whispered politics. The Hollow Queen rules through proxies and shadow, and few have ever seen her true face.",
    lore: "Scholars debate whether the Hollow Queen is one woman, many women, or something else entirely. Her court keeps no records — only memories, locked behind sealed lips.",
    x: 26,
    y: 18,
    width: 14,
    height: 20,
    image: "/images/velmoor.jpg",
  },
  {
    id: "ardos",
    name: "Ardos",
    subtitle: "The Wandering Reaches",
    ruler: "The Gale Council",
    element: "Wind",
    elementColor: "#38bdf8",
    description:
      "Ardos has no fixed borders — its people move with the wind, their sky-ships and floating platforms drifting between the great currents. The Gale Council convenes only when all ships are in alignment, which happens once every seven years.",
    lore: "To be exiled from Ardos is not to be cast to a place, but to be denied the wind itself. Exiles are given leaden boots and told to find their own sky.",
    x: 41,
    y: 17,
    width: 16,
    height: 18,
    image: "/images/ardos.jpg",
  },
  {
    id: "thalvera",
    name: "Thalvera",
    subtitle: "The Tideborn City",
    ruler: "The Tidal Senate",
    element: "Water",
    elementColor: "#06b6d4",
    description:
      "Built atop a living reef that breathes with the tides, Thalvera is a city that is never the same twice. The Tidal Senate governs by the rhythm of the sea — laws passed at high tide, revoked at low. Politics here move like the ocean: patient, powerful, and inevitable.",
    lore: "The reef beneath Thalvera is ancient beyond reckoning. Some senators believe it is not a reef at all, but the petrified spine of something that once swam before the world was named.",
    x: 60,
    y: 3,
    width: 16,
    height: 20,
    image: "/images/thalvera.jpg",
  },
  {
    id: "kraelvoss",
    name: "Kraelvoss",
    subtitle: "The Storm Cradle",
    ruler: "The Storm Marshal",
    element: "Lightning",
    elementColor: "#c084fc",
    description:
      "A perpetual tempest surrounds Kraelvoss, and its people have learned not to fear the thunder but to harness it. The Storm Marshal commands both armies and weather, and the city's spires are built to catch lightning and redirect it as power.",
    lore: "No enemy fleet has ever breached Kraelvoss's storm wall. Whether this is the work of the Storm Marshal or the storm's own will is a question even the Marshal cannot answer.",
    x: 67,
    y: 28,
    width: 16,
    height: 22,
    image: "/images/kraelvoss.jpg",
  },
  {
    id: "selvaran",
    name: "Selvaran",
    subtitle: "The Verdant Deep",
    ruler: "The Grove Synod",
    element: "Nature",
    elementColor: "#4ade80",
    description:
      "The heart of the continent, Selvaran is a cathedral of living wood and ancient root. The Grove Synod speaks not in words but in the language of growing things — patience measured in centuries, decisions made in the slow turning of seasons.",
    lore: "Every member of the Grove Synod is bonded to a tree at birth. When the Synod member dies, the tree blooms. When the tree dies, the Synod member must be found quickly, or the bond is lost forever.",
    x: 38,
    y: 45,
    width: 18,
    height: 20,
    image: "/images/selvaran.jpg",
  },
  {
    id: "glacivorn",
    name: "Glacivorn",
    subtitle: "The Frozen Silence",
    ruler: "The Frost Conclave",
    element: "Ice",
    elementColor: "#bfdbfe",
    description:
      "In the deep south where the Frozen Sea meets the land, Glacivorn stands in eternal winter. The Frost Conclave are scholars first and rulers second — they believe knowledge is the only warmth worth having, and their archives hold records going back to the world's first age.",
    lore: "Glacivorn's prisons are not cells but ice. Criminals are frozen — preserved, not dead — to be thawed when their sentence is complete. Some have waited three hundred years.",
    x: 20,
    y: 60,
    width: 16,
    height: 22,
    image: "/images/glacivorn.jpg",
  },
  {
    id: "durenmaal",
    name: "Durenmaal",
    subtitle: "The Stoneheart Basin",
    ruler: "The Elder Stones",
    element: "Earth",
    elementColor: "#d97706",
    description:
      "Carved into the bones of the world itself, Durenmaal's cities are inside the mountains rather than upon them. The Elder Stones are not rulers but oracles — ancient carved monoliths that the people consult before every major decision. No one remembers who carved them.",
    lore: "The Elder Stones give answers that make sense only in retrospect. A generation may suffer before understanding why the Stones advised what they did. The people trust them anyway.",
    x: 56,
    y: 62,
    width: 16,
    height: 22,
    image: "/images/durenmaal.jpg",
  },
];

// ─── Panel Component ──────────────────────────────────────────────────────────
function NationPanel({ nation, onClose }: { nation: typeof nations[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "min(420px, 100vw)",
        height: "100vh",
        background: "linear-gradient(160deg, rgba(6,8,15,0.98) 0%, rgba(12,14,28,0.99) 100%)",
        borderLeft: `1px solid ${nation.elementColor}33`,
        zIndex: 100,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nation image */}
      <div style={{ position: "relative", height: 220, flexShrink: 0, overflow: "hidden" }}>
        <img
          src={nation.image}
          alt={nation.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, transparent 40%, rgba(6,8,15,0.98) 100%)`,
          }}
        />
        {/* Colored accent overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `${nation.elementColor}18`,
            mixBlendMode: "color",
          }}
        />
        {/* Close */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            background: "rgba(6,8,15,0.8)",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#d4af37",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
          }}
        >
          <X size={16} />
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px 40px", flex: 1 }}>
        {/* Element badge */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              fontFamily: "'Cinzel', serif",
              color: nation.elementColor,
              textTransform: "uppercase",
              padding: "3px 10px",
              border: `1px solid ${nation.elementColor}55`,
              background: `${nation.elementColor}11`,
            }}
          >
            {nation.element}
          </span>
        </div>

        {/* Name */}
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 32,
            fontWeight: 700,
            color: "#e8d9b5",
            margin: "0 0 4px",
            lineHeight: 1.1,
          }}
        >
          {nation.name}
        </h2>
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 13,
            color: nation.elementColor,
            letterSpacing: "0.12em",
            margin: "0 0 4px",
          }}
        >
          {nation.subtitle}
        </p>
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 13,
            color: "rgba(232,217,181,0.45)",
            letterSpacing: "0.08em",
            margin: "0 0 20px",
            fontStyle: "italic",
          }}
        >
          Ruled by {nation.ruler}
        </p>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(to right, ${nation.elementColor}44, transparent)`,
            marginBottom: 20,
          }}
        />

        {/* Description */}
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(232,217,181,0.8)",
            margin: "0 0 24px",
          }}
        >
          {nation.description}
        </p>

        {/* Lore */}
        <div
          style={{
            background: `${nation.elementColor}0d`,
            border: `1px solid ${nation.elementColor}22`,
            padding: "16px 18px",
            borderLeft: `3px solid ${nation.elementColor}66`,
          }}
        >
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: nation.elementColor,
              margin: "0 0 8px",
              textTransform: "uppercase",
            }}
          >
            Ancient Lore
          </p>
          <p
            style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: 15,
              lineHeight: 1.65,
              color: "rgba(232,217,181,0.65)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            "{nation.lore}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Map Pin ──────────────────────────────────────────────────────────────────
function NationPin({
  nation,
  isSelected,
  onClick,
}: {
  nation: typeof nations[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: `${nation.x + nation.width / 2}%`,
        top: `${nation.y + nation.height / 2}%`,
        transform: "translate(-50%, -50%)",
        cursor: "pointer",
        zIndex: isSelected ? 20 : hovered ? 15 : 10,
      }}
    >
      {/* Invisible hit area over region */}
      <div
        style={{
          position: "absolute",
          left: `${-nation.width / 2}%`,
          top: `${-nation.height / 2}%`,
          width: `${nation.width}%`,
          height: `${nation.height}%`,
        }}
      />

      {/* Pulsing ring */}
      <AnimatePresence>
        {(hovered || isSelected) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: "absolute",
              inset: -16,
              border: `1px solid ${nation.elementColor}66`,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {isSelected && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -24,
            border: `1px solid ${nation.elementColor}44`,
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Pin dot */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: nation.elementColor,
          boxShadow: `0 0 ${hovered || isSelected ? 16 : 6}px ${nation.elementColor}`,
          border: "2px solid rgba(6,8,15,0.8)",
          transition: "box-shadow 0.3s",
        }}
      />

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(6,8,15,0.95)",
              border: `1px solid ${nation.elementColor}44`,
              padding: "6px 12px",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                color: "#e8d9b5",
                margin: 0,
                letterSpacing: "0.1em",
              }}
            >
              {nation.name}
            </p>
            <p
              style={{
                fontFamily: "'Crimson Pro', serif",
                fontSize: 11,
                color: nation.elementColor,
                margin: 0,
                fontStyle: "italic",
              }}
            >
              {nation.subtitle}
            </p>
            {/* Arrow */}
            <div
              style={{
                position: "absolute",
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 8,
                height: 8,
                background: "rgba(6,8,15,0.95)",
                border: `1px solid ${nation.elementColor}44`,
                borderTop: "none",
                borderLeft: "none",
                rotate: "45deg",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function WorldMapPage() {
  const [selected, setSelected] = useState<typeof nations[0] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleSelect = (nation: typeof nations[0]) => {
    setSelected(prev => prev?.id === nation.id ? null : nation);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06080f",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Page header */}
      <div
        style={{
          position: "relative",
          zIndex: 5,
          paddingTop: 100,
          paddingBottom: 32,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 11,
            letterSpacing: "0.35em",
            color: "#d4af37",
            textTransform: "uppercase",
            margin: "0 0 12px",
          }}
        >
          ── The Lands of Serenita ──
        </p>
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #d4af37 0%, #e8d9b5 50%, #c8a96e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 10px",
            letterSpacing: "0.08em",
          }}
        >
          World Map
        </h1>
        <p
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: 16,
            color: "rgba(232,217,181,0.5)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Eight nations. One world. Countless fates.
        </p>
      </div>

      {/* Map container */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 60px",
          position: "relative",
          zIndex: 3,
        }}
      >
        {/* Hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 16,
            justifyContent: "flex-end",
          }}
        >
          <MapPin size={12} color="rgba(212,175,55,0.5)" />
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "rgba(212,175,55,0.5)",
              textTransform: "uppercase",
            }}
          >
            Click a nation to explore
          </span>
        </div>

        {/* Map wrapper */}
        <div
          ref={mapRef}
          style={{
            position: "relative",
            width: "100%",
            border: "1px solid rgba(212,175,55,0.2)",
            boxShadow: "0 0 60px rgba(212,175,55,0.06), 0 0 120px rgba(0,0,0,0.8)",
          }}
        >
          {/* Corner ornaments */}
          {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
            <div
              key={corner}
              style={{
                position: "absolute",
                width: 24,
                height: 24,
                borderColor: "rgba(212,175,55,0.5)",
                borderStyle: "solid",
                borderWidth: 0,
                zIndex: 4,
                ...(corner === "top-left" && { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 }),
                ...(corner === "top-right" && { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 }),
                ...(corner === "bottom-left" && { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 }),
                ...(corner === "bottom-right" && { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 }),
              }}
            />
          ))}

          {/* The map image */}
          <img
            src="/images/map.png"
            alt="The Lands of Serenita"
            style={{ width: "100%", display: "block" }}
          />

          {/* Overlay tint when panel is open */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(6,8,15,0.25)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            )}
          </AnimatePresence>

          {/* Nation pins */}
          {nations.map((nation) => (
            <NationPin
              key={nation.id}
              nation={nation}
              isSelected={selected?.id === nation.id}
              onClick={() => handleSelect(nation)}
            />
          ))}
        </div>

        {/* Nation quick-select row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 20,
            justifyContent: "center",
          }}
        >
          {nations.map((n) => (
            <motion.button
              key={n.id}
              onClick={() => handleSelect(n)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "5px 12px",
                background: selected?.id === n.id ? `${n.elementColor}22` : "transparent",
                border: `1px solid ${selected?.id === n.id ? n.elementColor : "rgba(212,175,55,0.2)"}`,
                color: selected?.id === n.id ? n.elementColor : "rgba(232,217,181,0.5)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {n.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Atmospheric bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "radial-gradient(ellipse at 20% 50%, rgba(212,175,55,0.03) 0%, transparent 60%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Side panel */}
      <AnimatePresence>
        {selected && (
          <NationPanel nation={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}