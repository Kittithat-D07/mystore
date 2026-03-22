import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:100, fontWeight:900, color:"var(--bg-deep)", lineHeight:1 }}>404</p>
        <h1 style={{ fontSize:24, fontWeight:800, color:"var(--ink)", marginBottom:8, marginTop:-8 }}>ไม่พบหน้านี้</h1>
        <p style={{ color:"var(--ink-3)", marginBottom:24 }}>หน้าที่คุณหาอาจถูกย้ายหรือลบไปแล้ว</p>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", background:"var(--accent)", color:"#fff", borderRadius:12, fontWeight:700, fontSize:14, textDecoration:"none" }}>
          <ArrowLeft size={16}/> กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}
