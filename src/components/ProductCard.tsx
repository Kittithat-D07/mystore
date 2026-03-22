"use client";
import Link from "next/link";
import AddToCartBtn from "./AddToCartBtn";

interface Product {
  id: string; name: string; price: number; sku: string; stock: number;
  images: string[]; category?: { name: string } | null;
}

export default function ProductCard({ p }: { p: Product }) {
  const C: React.CSSProperties = {
    position:"relative", aspectRatio:"4/5", borderRadius:16, overflow:"hidden",
    background:"var(--bg-soft)", border:"1.5px solid var(--border)",
    marginBottom:12, transition:"transform 0.3s, box-shadow 0.3s", cursor:"pointer",
  };
  return (
    <Link href={`/product/${p.id}`} style={{ textDecoration:"none", display:"block" }}>
      <div style={C}
        onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="translateY(-5px)";el.style.boxShadow="0 16px 40px rgba(109,40,217,0.2)";}}
        onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform="";el.style.boxShadow="";}}>
        {p.images[0] ? (
          <img src={p.images[0]} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--border)" }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
              <path d="m21 15-5-5L5 21" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        {p.category && (
          <div style={{ position:"absolute", top:10, left:10 }}>
            <span style={{ background:"rgba(245,241,255,0.92)", color:"var(--accent)", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{p.category.name}</span>
          </div>
        )}
        {p.stock===0 && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(237,232,248,0.75)" }}>
            <span style={{ background:"var(--ink)", color:"#fff", fontSize:12, fontWeight:700, padding:"6px 16px", borderRadius:20 }}>หมดสต็อก</span>
          </div>
        )}
        {p.stock>0 && p.stock<=5 && (
          <div style={{ position:"absolute", top:10, right:10 }}>
            <span style={{ background:"var(--danger)", color:"#fff", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>เหลือ {p.stock}</span>
          </div>
        )}
        {p.stock>0 && <AddToCartBtn product={p}/>}
      </div>
      <div style={{ paddingInline:2 }}>
        <p style={{ fontWeight:600, fontSize:14, color:"var(--ink)", marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontWeight:800, fontSize:20, color:"var(--ink)" }}>฿{p.price.toLocaleString()}</p>
          <p style={{ fontSize:11, color:"var(--ink-3)", fontFamily:"monospace" }}>{p.sku}</p>
        </div>
      </div>
    </Link>
  );
}
