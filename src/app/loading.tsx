export default function Loading() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14 }}>
      <div style={{ width:38, height:38, border:"3px solid var(--bg-deep)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
      <p style={{ color:"var(--ink-3)", fontWeight:600, fontSize:14 }}>กำลังโหลด...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
