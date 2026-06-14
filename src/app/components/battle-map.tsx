import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { X } from "lucide-react";

interface MapToken {
  id: string;
  session_id: string;
  character_id: string | null;
  entry_id: string | null;
  token_type: string;
  label: string | null;
  x: number;
  y: number;
}

interface Character {
  id: string;
  character_name: string;
  portrait_url: string;
  player_id: string;
}

interface InitiativeEntry {
  id: string;
  character_id: string | null;
  is_monster: boolean;
  monster_name: string | null;
  character?: Character;
}

interface BattleMapProps {
  sessionId: string;
  isDM: boolean;
  userId: string;
  characters: Character[];
  entries: InitiativeEntry[];
  onClose: () => void;
}

const CELL = 52;

export function BattleMap({ sessionId, isDM, userId, characters, entries, onClose }: BattleMapProps) {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(20);
  const [tokens, setTokens] = useState<MapToken[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });
  const pinchDist = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [walls, setWalls] = useState<{ x: number; y: number }[]>([]);
  const [drawings, setDrawings] = useState<{ points: { x: number; y: number }[]; color: string }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [penColor, setPenColor] = useState("#ef4444");
  const [paintMode, setPaintMode] = useState<"none" | "wall" | "erase" | "pen" | "eraseDrawing">("none");

  // Refs for touch state — using refs so handlers always see latest values
  const draggingIdRef = useRef<string | null>(null);
  const tokensRef = useRef<MapToken[]>([]);
  const panRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const touchIsDraggingToken = useRef(false);

  // Keep refs in sync
  useEffect(() => { draggingIdRef.current = draggingId; }, [draggingId]);
  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { panRef.current = pan; }, [pan]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);

  // Prevent default on the container to stop browser pull-to-refresh etc.
  // but we do NOT blanket-prevent touchstart so buttons still work.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preventMove = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchmove", preventMove, { passive: false });
    return () => { el.removeEventListener("touchmove", preventMove); };
  }, []);

  // Load grid + walls + drawings
  useEffect(() => {
    supabase
      .from("battle_sessions")
      .select("map_rows,map_cols,map_walls,map_drawings")
      .eq("id", sessionId)
      .single()
      .then(({ data }) => {
        if (data) {
          setRows(data.map_rows ?? 20);
          setCols(data.map_cols ?? 20);
          setWalls(data.map_walls ?? []);
          setDrawings(data.map_drawings ?? []);
        }
      });
  }, [sessionId]);

  // Load tokens
  const loadTokens = useCallback(async () => {
    const { data } = await supabase.from("map_tokens").select("*").eq("session_id", sessionId);
    if (data) setTokens(data);
  }, [sessionId]);

  useEffect(() => { loadTokens(); }, [loadTokens]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`map-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "map_tokens" }, () => loadTokens())
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_sessions", filter: `id=eq.${sessionId}` }, (payload) => {
        const data = payload.new as any;
        if (data?.map_walls) setWalls(data.map_walls);
        if (data?.map_drawings) setDrawings(data.map_drawings);
        if (data?.map_rows) setRows(data.map_rows);
        if (data?.map_cols) setCols(data.map_cols);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId, loadTokens]);

  const saveGrid = async (r: number, c: number) => {
    await supabase.from("battle_sessions").update({ map_rows: r, map_cols: c }).eq("id", sessionId);
  };

  const addToken = async (entry: InitiativeEntry) => {
    const exists = tokens.find((t) => t.entry_id === entry.id);
    if (exists) return;
    await supabase.from("map_tokens").insert({
      session_id: sessionId,
      character_id: entry.character_id,
      entry_id: entry.id,
      token_type: entry.is_monster ? "monster" : "character",
      label: entry.is_monster ? entry.monster_name : entry.character?.character_name ?? null,
      x: 0,
      y: 0,
    });
  };

  const removeToken = async (id: string) => {
    await supabase.from("map_tokens").delete().eq("id", id);
  };

  const canMove = (token: MapToken) => {
    if (isDM) return true;
    const char = characters.find((c) => c.id === token.character_id);
    return char?.player_id === userId;
  };

  // ── DESKTOP MOUSE ──────────────────────────────────────────────────────────

  const onTokenMouseDown = (e: React.MouseEvent, token: MapToken) => {
    if (!canMove(token)) return;
    e.stopPropagation();
    e.preventDefault();
    setDraggingId(token.id);
    dragOffset.current = { x: (CELL * scale) / 2, y: (CELL * scale) / 2 };
  };

  const onBgMouseDown = (e: React.MouseEvent) => {
    if (paintMode === "pen") {
      setIsDrawing(true);
      const rect = containerRef.current!.getBoundingClientRect();
      const px = (e.clientX - rect.left - pan.x) / scale;
      const py = (e.clientY - rect.top - pan.y) / scale;
      setCurrentStroke([{ x: px, y: py }]);
      return;
    }
    if (paintMode !== "none") return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    lastPan.current = { ...pan };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (paintMode === "pen" && isDrawing) {
      const rect = containerRef.current!.getBoundingClientRect();
      const px = (e.clientX - rect.left - pan.x) / scale;
      const py = (e.clientY - rect.top - pan.y) / scale;
      setCurrentStroke((prev) => [...prev, { x: px, y: py }]);
      return;
    }
    if (e.buttons === 1 && (paintMode === "wall" || paintMode === "erase")) {
      paintCell(e);
      return;
    }
    if (draggingId) {
      const rect = containerRef.current!.getBoundingClientRect();
      const rawX = e.clientX - rect.left - dragOffset.current.x - pan.x;
      const rawY = e.clientY - rect.top - dragOffset.current.y - pan.y;
      const cx = Math.max(0, Math.min(cols - 1, Math.floor(rawX / (CELL * scale))));
      const cy = Math.max(0, Math.min(rows - 1, Math.floor(rawY / (CELL * scale))));
      setTokens((prev) => prev.map((t) => (t.id === draggingId ? { ...t, x: cx, y: cy } : t)));
    } else if (isPanning.current) {
      setPan({
        x: lastPan.current.x + e.clientX - panStart.current.x,
        y: lastPan.current.y + e.clientY - panStart.current.y,
      });
    }
  };

  const onMouseUp = async (e: React.MouseEvent) => {
    if (paintMode === "pen" && isDrawing && currentStroke.length > 1) {
      setIsDrawing(false);
      const newDrawings = [...drawings, { points: currentStroke, color: penColor }];
      setDrawings(newDrawings);
      setCurrentStroke([]);
      await supabase.from("battle_sessions").update({ map_drawings: newDrawings }).eq("id", sessionId);
      isPanning.current = false;
      return;
    }
    if (paintMode === "eraseDrawing" && drawings.length > 0) {
      const newDrawings = drawings.slice(0, -1);
      setDrawings(newDrawings);
      await supabase.from("battle_sessions").update({ map_drawings: newDrawings }).eq("id", sessionId);
      isPanning.current = false;
      return;
    }
    setIsDrawing(false);
    setCurrentStroke([]);
    isPanning.current = false;
    if (draggingId) {
      const token = tokens.find((t) => t.id === draggingId);
      if (token) await supabase.from("map_tokens").update({ x: token.x, y: token.y }).eq("id", token.id);
      setDraggingId(null);
    }
  };

  const paintCell = async (e: React.MouseEvent) => {
    if (paintMode === "none" || paintMode === "pen" || paintMode === "eraseDrawing") return;
    const rect = containerRef.current!.getBoundingClientRect();
    const cx = Math.max(0, Math.min(cols - 1, Math.floor((e.clientX - rect.left - pan.x) / (CELL * scale))));
    const cy = Math.max(0, Math.min(rows - 1, Math.floor((e.clientY - rect.top - pan.y) / (CELL * scale))));
    let newWalls;
    if (paintMode === "wall") {
      const exists = walls.some((w) => w.x === cx && w.y === cy);
      if (exists) return;
      newWalls = [...walls, { x: cx, y: cy }];
    } else {
      newWalls = walls.filter((w) => !(w.x === cx && w.y === cy));
    }
    setWalls(newWalls);
    await supabase.from("battle_sessions").update({ map_walls: newWalls }).eq("id", sessionId);
  };

  // ── TOUCH ──────────────────────────────────────────────────────────────────

  const onTokenTouchStart = (e: React.TouchEvent, token: MapToken) => {
    if (!canMove(token)) return;
    if (e.touches.length !== 1) return;
    e.stopPropagation();
    // Do NOT call preventDefault here — let the touch event propagate so
    // the container's touchmove passive:false handler can still call it.
    touchIsDraggingToken.current = true;
    setDraggingId(token.id);
    draggingIdRef.current = token.id;
    dragOffset.current = { x: (CELL * scaleRef.current) / 2, y: (CELL * scaleRef.current) / 2 };
  };

  const onTouchStart = (e: React.TouchEvent) => {
    // Drawing mode
    if (paintMode === "pen" && e.touches.length === 1) {
      setIsDrawing(true);
      const touch = e.touches[0];
      const rect = containerRef.current!.getBoundingClientRect();
      const px = (touch.clientX - rect.left - panRef.current.x) / scaleRef.current;
      const py = (touch.clientY - rect.top - panRef.current.y) / scaleRef.current;
      setCurrentStroke([{ x: px, y: py }]);
      return;
    }

    // Two-finger pinch/pan start
    if (e.touches.length === 2) {
      setDraggingId(null);
      draggingIdRef.current = null;
      touchIsDraggingToken.current = false;
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchDist.current = d;
      panStart.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      lastPan.current = { ...panRef.current };
      return;
    }

    // One finger — start panning (unless a token touch already fired)
    if (!touchIsDraggingToken.current) {
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPan.current = { ...panRef.current };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Drawing
    if (paintMode === "pen" && isDrawing && e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = containerRef.current!.getBoundingClientRect();
      const px = (touch.clientX - rect.left - panRef.current.x) / scaleRef.current;
      const py = (touch.clientY - rect.top - panRef.current.y) / scaleRef.current;
      setCurrentStroke((prev) => [...prev, { x: px, y: py }]);
      return;
    }

    // Two-finger pinch + pan
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (pinchDist.current !== null) {
        const delta = d - pinchDist.current;
        setScale((s) => {
          const next = Math.max(0.3, Math.min(3, s + delta * 0.01));
          scaleRef.current = next;
          return next;
        });
      }
      pinchDist.current = d;

      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      setPan((p) => {
        const next = { x: p.x + midX - panStart.current.x, y: p.y + midY - panStart.current.y };
        panRef.current = next;
        return next;
      });
      panStart.current = { x: midX, y: midY };
      return;
    }

    // One finger
    pinchDist.current = null;
    const touch = e.touches[0];

    if (touchIsDraggingToken.current && draggingIdRef.current) {
      // Move token
      const rect = containerRef.current!.getBoundingClientRect();
      const rawX = touch.clientX - rect.left - dragOffset.current.x - panRef.current.x;
      const rawY = touch.clientY - rect.top - dragOffset.current.y - panRef.current.y;
      const cx = Math.max(0, Math.min(cols - 1, Math.floor(rawX / (CELL * scaleRef.current))));
      const cy = Math.max(0, Math.min(rows - 1, Math.floor(rawY / (CELL * scaleRef.current))));
      setTokens((prev) => prev.map((t) => (t.id === draggingIdRef.current ? { ...t, x: cx, y: cy } : t)));
    } else {
      // Pan the map — this is the main fix: always pan on one-finger when not on a token
      const dx = touch.clientX - panStart.current.x;
      const dy = touch.clientY - panStart.current.y;
      const next = { x: lastPan.current.x + dx, y: lastPan.current.y + dy };
      setPan(next);
      panRef.current = next;
    }
  };

  const onTouchEnd = async () => {
    if (paintMode === "pen" && isDrawing && currentStroke.length > 1) {
      setIsDrawing(false);
      const newDrawings = [...drawings, { points: currentStroke, color: penColor }];
      setDrawings(newDrawings);
      setCurrentStroke([]);
      await supabase.from("battle_sessions").update({ map_drawings: newDrawings }).eq("id", sessionId);
      return;
    }
    pinchDist.current = null;
    if (draggingIdRef.current) {
      const token = tokensRef.current.find((t) => t.id === draggingIdRef.current);
      if (token) await supabase.from("map_tokens").update({ x: token.x, y: token.y }).eq("id", token.id);
      setDraggingId(null);
      draggingIdRef.current = null;
    }
    touchIsDraggingToken.current = false;
    // Reset pan anchor so next touch starts fresh
    lastPan.current = { ...panRef.current };
  };

  // ── WHEEL ZOOM ─────────────────────────────────────────────────────────────

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => {
      const next = Math.max(0.3, Math.min(3, s - e.deltaY * 0.001));
      scaleRef.current = next;
      return next;
    });
  };

  // ── HELPERS ────────────────────────────────────────────────────────────────

  const getPortrait = (token: MapToken) => {
    if (token.character_id) {
      const char = characters.find((c) => c.id === token.character_id);
      if (char?.portrait_url) return char.portrait_url;
    }
    const entry = entries.find((e) => e.id === token.entry_id);
    return entry?.character?.portrait_url ?? null;
  };

  const tokenColor = (token: MapToken) => (token.token_type === "monster" ? "#ef4444" : "#c4a96b");

  const clearDrawings = async () => {
    setDrawings([]);
    await supabase.from("battle_sessions").update({ map_drawings: [] }).eq("id", sessionId);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.92)", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: "rgba(10,8,5,0.95)", borderBottom: "1px solid rgba(196,169,107,0.15)", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "serif", fontSize: 13, color: "#c4a96b", fontWeight: 700 }}>⚔ Battle Map</span>

        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => setScale((s) => Math.max(0.3, s - 0.1))} style={toolBtn}>−</button>
          <span style={{ fontFamily: "serif", fontSize: 11, color: "#6b7280", minWidth: 36, textAlign: "center" }}>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.1))} style={toolBtn}>+</button>
          <button onClick={() => { setScale(1); scaleRef.current = 1; setPan({ x: 0, y: 0 }); panRef.current = { x: 0, y: 0 }; }} style={{ ...toolBtn, fontSize: 9 }}>Reset</button>
        </div>

        {/* Grid size (DM only) */}
        {isDM && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "serif", fontSize: 10, color: "#6b7280" }}>Grid</span>
            <input type="number" min={2} max={300} value={cols} onChange={(e) => setCols(Number(e.target.value))} onBlur={() => saveGrid(rows, cols)} style={{ width: 44, padding: "3px 6px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(196,169,107,0.2)", borderRadius: 4, color: "#e5e0d5", fontFamily: "serif", fontSize: 11, textAlign: "center" }} />
            <span style={{ color: "#6b7280", fontSize: 11 }}>×</span>
            <input type="number" min={2} max={300} value={rows} onChange={(e) => setRows(Number(e.target.value))} onBlur={() => saveGrid(rows, cols)} style={{ width: 44, padding: "3px 6px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(196,169,107,0.2)", borderRadius: 4, color: "#e5e0d5", fontFamily: "serif", fontSize: 11, textAlign: "center" }} />
          </div>
        )}

        {isDM && (
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPaintMode((m) => (m === "wall" ? "none" : "wall"))} style={{ ...toolBtn, border: `1px solid ${paintMode === "wall" ? "#f97316" : "rgba(255,255,255,0.1)"}`, color: paintMode === "wall" ? "#f97316" : "#e5e0d5" }}>🧱 Wall</button>
            <button onClick={() => setPaintMode((m) => (m === "erase" ? "none" : "erase"))} style={{ ...toolBtn, border: `1px solid ${paintMode === "erase" ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: paintMode === "erase" ? "#ef4444" : "#e5e0d5" }}>✕ Erase</button>
          </div>
        )}

        {isDM && entries.length > 0 && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {entries.map((entry) => {
              const hasToken = tokens.some((t) => t.entry_id === entry.id);
              const label = entry.is_monster ? entry.monster_name : entry.character?.character_name;
              return (
                <button key={entry.id} onClick={() => addToken(entry)} disabled={hasToken} style={{ padding: "3px 8px", fontFamily: "serif", fontSize: 10, background: hasToken ? "rgba(255,255,255,0.04)" : entry.is_monster ? "rgba(239,68,68,0.1)" : "rgba(196,169,107,0.1)", border: `1px solid ${hasToken ? "rgba(255,255,255,0.08)" : entry.is_monster ? "rgba(239,68,68,0.3)" : "rgba(196,169,107,0.3)"}`, borderRadius: 6, color: hasToken ? "#4b5563" : entry.is_monster ? "#f87171" : "#c4a96b", cursor: hasToken ? "default" : "pointer" }}>
                  {hasToken ? "✓ " : "+ "}{label}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setPaintMode((m) => (m === "pen" ? "none" : "pen"))} style={{ ...toolBtn, border: `1px solid ${paintMode === "pen" ? penColor : "rgba(255,255,255,0.1)"}`, color: paintMode === "pen" ? penColor : "#e5e0d5" }}>✏️ Draw</button>
          {paintMode === "pen" && ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#c084fc", "#ffffff"].map((c) => (
            <div key={c} onClick={() => setPenColor(c)} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: `2px solid ${penColor === c ? "#fff" : "transparent"}`, cursor: "pointer", flexShrink: 0 }} />
          ))}
          <button onClick={() => setPaintMode((m) => (m === "eraseDrawing" ? "none" : "eraseDrawing"))} style={{ ...toolBtn, border: `1px solid ${paintMode === "eraseDrawing" ? "#ef4444" : "rgba(255,255,255,0.1)"}`, color: paintMode === "eraseDrawing" ? "#ef4444" : "#e5e0d5" }}>🧹 Erase Drawing</button>
          {isDM && <button onClick={clearDrawings} style={{ ...toolBtn, color: "#6b7280" }}>Clear All</button>}
        </div>

        <button onClick={onClose} style={{ marginLeft: "auto", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "6px 16px", color: "#f87171", cursor: "pointer", fontFamily: "serif", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.05em" }}>
          <X size={15} /> Close Map
        </button>
      </div>

      {/* Map canvas */}
      <div
        ref={containerRef}
        style={{ flex: 1, overflow: "hidden", position: "relative", cursor: draggingId ? "grabbing" : paintMode === "pen" ? "crosshair" : paintMode !== "none" ? "cell" : "grab", touchAction: "none" }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onMouseDown={onBgMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <div style={{ position: "absolute", transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: "0 0", width: cols * CELL, height: rows * CELL, background: "#1a1410" }}>
          {/* Grid lines */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(196,169,107,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(196,169,107,0.25) 1px, transparent 1px)`, backgroundSize: `${CELL}px ${CELL}px` }} />

          {/* Walls */}
          {walls.map((w, i) => (
            <div key={i} style={{ position: "absolute", left: w.x * CELL, top: w.y * CELL, width: CELL, height: CELL, background: "rgba(120,80,20,0.6)", border: "1px solid rgba(160,100,30,0.4)", pointerEvents: "none" }} />
          ))}

          {/* Drawings */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {drawings.map((stroke, i) => (
              <polyline key={i} points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={stroke.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            ))}
            {currentStroke.length > 1 && (
              <polyline points={currentStroke.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={penColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
            )}
          </svg>

          {/* Tokens */}
          {tokens.map((token) => {
            const portrait = getPortrait(token);
            const color = tokenColor(token);
            const movable = canMove(token);
            return (
              <div
                key={token.id}
                onMouseDown={(e) => onTokenMouseDown(e, token)}
                onTouchStart={(e) => onTokenTouchStart(e, token)}
                style={{ position: "absolute", left: token.x * CELL + 4, top: token.y * CELL + 4, width: CELL - 8, height: CELL - 8, borderRadius: "50%", border: `2px solid ${color}`, overflow: "hidden", cursor: movable ? "grab" : "default", boxShadow: `0 0 8px ${color}66`, userSelect: "none", zIndex: draggingId === token.id ? 10 : 1, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {portrait ? (
                  <img src={portrait} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", pointerEvents: "none" }} />
                ) : (
                  <span style={{ fontSize: CELL * 0.25, color, fontFamily: "serif", fontWeight: 700, pointerEvents: "none" }}>{(token.label ?? "?").slice(0, 2).toUpperCase()}</span>
                )}
                <div style={{ position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "#e5e0d5", fontFamily: "serif", whiteSpace: "nowrap", background: "rgba(0,0,0,0.7)", padding: "1px 4px", borderRadius: 3, pointerEvents: "none" }}>{token.label}</div>
                {isDM && (
                  <div onClick={(e) => { e.stopPropagation(); removeToken(token.id); }} style={{ position: "absolute", top: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 9, color: "#fff", zIndex: 5 }}>✕</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  padding: "3px 8px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 4,
  color: "#e5e0d5",
  cursor: "pointer",
  fontFamily: "serif",
  fontSize: 12,
};