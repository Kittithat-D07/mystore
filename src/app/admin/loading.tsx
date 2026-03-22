export default function AdminLoading() {
  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ width: 120, height: 18, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: 80, height: 13, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      {/* Stat cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 60, height: 22, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ width: 50, height: 12, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1.5px solid var(--border)" }}>
          <div style={{ width: 100, height: 16, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-l)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-deep)", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: "40%", height: 14, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ width: "25%", height: 12, borderRadius: 6, background: "var(--bg-deep)", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
