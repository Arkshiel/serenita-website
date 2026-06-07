export function OrnateDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,175,55,0.6))" }} />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L14 9H21L15.5 13.5L17.5 21L12 16.5L6.5 21L8.5 13.5L3 9H10L12 2Z" fill="#d4af37" opacity="0.9" />
      </svg>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(212,175,55,0.6))" }} />
    </div>
  );
}

export function GenshinBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ padding: "1px" }}>
      <div
        className="absolute inset-0 rounded"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.8), rgba(200,169,110,0.2), rgba(212,175,55,0.8))",
          borderRadius: "inherit",
        }}
      />
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-amber-400 opacity-80" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-400 opacity-80" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-amber-400 opacity-80" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-amber-400 opacity-80" />
      <div className="relative" style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
