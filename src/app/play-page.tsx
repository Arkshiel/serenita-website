import { useEffect, useState } from "react";
import { useAuth } from "./components/auth-provider";
import { DiceRoller } from "./components/dice-roller";
import { CharacterProfile } from "./components/character-profile";

type Tab = "dice" | "profile" | "team" | "inventory" | "monsters" | "initiative" | "players";

export function PlayPage() {
  const { role, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dice");

  useEffect(() => {
    if (!loading && (role === "visitor" || !profile)) {
      window.location.href = "/";
    }
  }, [role, loading, profile]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#06080f",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <p style={{ fontFamily: "'Cinzel', serif", color: "rgba(212,175,55,0.5)", letterSpacing: "0.2em", fontSize: "0.7rem", textTransform: "uppercase" }}>
          Entering the realm...
        </p>
      </div>
    );
  }

  const tabs = [
    { label: "🎲 Dice Roll", id: "dice" as Tab },
    { label: "⚔ Profile", id: "profile" as Tab },
    { label: "🛡 Team", id: "team" as Tab },
    { label: "🎒 Inventory", id: "inventory" as Tab },
    ...(role === "dungeon_master" ? [
      { label: "👹 Monsters", id: "monsters" as Tab },
      { label: "⚡ Initiative", id: "initiative" as Tab },
      { label: "👥 Players", id: "players" as Tab },
    ] : []),
  ];

  const isDmTab = (id: Tab) => ["monsters", "initiative", "players"].includes(id);

  return (
    <div style={{ minHeight: "100vh", background: "#06080f", color: "#e8d9b5" }}>
      {/* Play Hub Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        height: 64, padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(6,8,15,0.98)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        backdropFilter: "blur(12px)",
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ color: "#d4af37" }}>★</span>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.85rem", letterSpacing: "0.2em", color: "#e8d9b5" }}>Serenita</span>
        </a>

        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "0.12em",
                textTransform: "uppercase", padding: "8px 14px",
                background: activeTab === tab.id
                  ? isDmTab(tab.id) ? "rgba(192,132,252,0.1)" : "rgba(212,175,55,0.08)"
                  : "none",
                border: "1px solid",
                borderColor: activeTab === tab.id
                  ? isDmTab(tab.id) ? "rgba(192,132,252,0.35)" : "rgba(212,175,55,0.3)"
                  : "transparent",
                color: activeTab === tab.id
                  ? isDmTab(tab.id) ? "#c084fc" : "#d4af37"
                  : isDmTab(tab.id) ? "rgba(192,132,252,0.7)" : "rgba(232,217,181,0.55)",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (activeTab === tab.id) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = isDmTab(tab.id) ? "#c084fc" : "#e8d9b5";
                el.style.borderColor = isDmTab(tab.id) ? "rgba(192,132,252,0.25)" : "rgba(212,175,55,0.2)";
              }}
              onMouseLeave={(e) => {
                if (activeTab === tab.id) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = isDmTab(tab.id) ? "rgba(192,132,252,0.7)" : "rgba(232,217,181,0.55)";
                el.style.borderColor = "transparent";
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(212,175,55,0.5)" }}>
          {profile?.username}
          {role === "dungeon_master" && (
            <span style={{ marginLeft: 8, color: "#c084fc" }}>⚔ DM</span>
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={{ paddingTop: 64, padding: "84px 32px 32px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.25em", color: "#d4af37", textTransform: "uppercase", marginBottom: 6 }}>
            Session Hub
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#e8d9b5", fontWeight: 700 }}>
            {activeTab === "dice" && "Dice Roller"}
            {activeTab === "profile" && "Character Sheet"}
            {activeTab === "team" && "Team Status"}
            {activeTab === "inventory" && "Inventory"}
            {activeTab === "monsters" && "Monster List"}
            {activeTab === "initiative" && "Initiative Order"}
            {activeTab === "players" && "Player Panel"}
          </h1>
        </div>

        {activeTab === "dice" && <DiceRoller />}
        {activeTab === "profile" && <CharacterProfile />}

        {activeTab !== "dice" && activeTab !== "profile" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.1rem", color: "rgba(232,217,181,0.3)", fontStyle: "italic" }}>
              Coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}