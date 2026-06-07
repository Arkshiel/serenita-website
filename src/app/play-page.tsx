import { useEffect } from "react";
import { useAuth } from "./components/auth-provider";

export function PlayPage() {
  const { role, profile, loading } = useAuth();

  // Redirect visitors away
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
          {[
            { label: "🎲 Dice Roll", id: "dice" },
            { label: "⚔ Profile", id: "profile" },
            { label: "🛡 Team", id: "team" },
            { label: "🎒 Inventory", id: "inventory" },
            ...(role === "dungeon_master" ? [
              { label: "👹 Monsters", id: "monsters" },
              { label: "⚡ Initiative", id: "initiative" },
              { label: "👥 Players", id: "players" },
            ] : []),
          ].map((tab) => {
            const isDmTab = ["monsters", "initiative", "players"].includes(tab.id);
            return (
              <button key={tab.id}
                style={{
                  fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", padding: "8px 14px",
                  background: "none", border: "1px solid transparent",
                  color: isDmTab ? "rgba(192,132,252,0.7)" : "rgba(232,217,181,0.55)",
                  cursor: "pointer", transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = isDmTab ? "#c084fc" : "#e8d9b5";
                  el.style.borderColor = isDmTab ? "rgba(192,132,252,0.25)" : "rgba(212,175,55,0.2)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.color = isDmTab ? "rgba(192,132,252,0.7)" : "rgba(232,217,181,0.55)";
                  el.style.borderColor = "transparent";
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.12em", color: "rgba(212,175,55,0.5)" }}>
          {profile?.username}
          {role === "dungeon_master" && (
            <span style={{ marginLeft: 8, color: "#c084fc" }}>⚔ DM</span>
          )}
        </div>
      </nav>

      {/* Content */}
      <div style={{ paddingTop: 64, padding: "100px 32px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "0.25em", color: "#d4af37", textTransform: "uppercase", marginBottom: 8 }}>
            Session Hub
          </p>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "#e8d9b5", fontWeight: 700 }}>
            Welcome, {profile?.username}
          </h1>
          <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.5)", fontSize: "1.05rem", marginTop: 10 }}>
            {role === "dungeon_master"
              ? "Your campaign awaits. The realm bends to your will."
              : "Your adventure begins here. May the dice favor you."}
          </p>
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🎲", label: "Dice Roller", desc: "Roll any die. Results shared with the party.", color: "#d4af37" },
            { icon: "⚔", label: "Character Sheet", desc: "Your stats, HP, mana, and skills.", color: "#f97316" },
            { icon: "🛡", label: "Team Status", desc: "See your party's HP and status in real time.", color: "#38bdf8" },
            { icon: "🎒", label: "Inventory", desc: "Your items, equipment, and consumables.", color: "#86efac" },
            ...(role === "dungeon_master" ? [
              { icon: "👹", label: "Monster List", desc: "Manage encounters and enemy stats.", color: "#c084fc" },
              { icon: "⚡", label: "Roll Initiative", desc: "Alert the party and set turn order.", color: "#fbbf24" },
              { icon: "👥", label: "Player Panel", desc: "Edit stats, HP, buffs, XP for all players.", color: "#4ade80" },
            ] : []),
          ].map((card) => (
            <div key={card.label}
              style={{
                padding: 24, background: "rgba(13,17,32,0.8)",
                border: `1px solid ${card.color}22`,
                position: "relative", overflow: "hidden",
                transition: "border-color 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = card.color + "55")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = card.color + "22")}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{card.icon}</div>
              <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: "0.9rem", color: card.color, marginBottom: 8, letterSpacing: "0.06em" }}>
                {card.label}
              </h3>
              <p style={{ fontFamily: "'Crimson Pro', serif", color: "rgba(232,217,181,0.5)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {card.desc}
              </p>
              <div style={{
                position: "absolute", top: 12, right: 12,
                fontFamily: "'Cinzel', serif", fontSize: "0.45rem",
                letterSpacing: "0.15em", color: "rgba(212,175,55,0.35)",
                textTransform: "uppercase", border: "1px solid rgba(212,175,55,0.15)",
                padding: "3px 7px",
              }}>
                Coming Soon
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}