"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div style={{ aspectRatio:"1", borderRadius:20, background:"var(--bg-soft)", border:"1.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="56" height="56" fill="none" stroke="var(--border)" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"/>
          <path d="m21 15-5-5L5 21" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  const prev = () => setSelected(s => (s - 1 + images.length) % images.length);
  const next = () => setSelected(s => (s + 1) % images.length);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Main */}
      <div style={{ position:"relative", aspectRatio:"1", borderRadius:20, overflow:"hidden", background:"var(--bg-soft)", border:"1.5px solid var(--border)" }}
        onMouseEnter={e => { const btns = e.currentTarget.querySelectorAll<HTMLElement>(".nav-btn"); btns.forEach(b=>b.style.opacity="1"); }}
        onMouseLeave={e => { const btns = e.currentTarget.querySelectorAll<HTMLElement>(".nav-btn"); btns.forEach(b=>b.style.opacity="0"); }}>
        <img src={images[selected]} alt={`${name} ${selected+1}`} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.3s" }}/>
        {images.length > 1 && (
          <>
            {[{fn:prev,side:"left",label:"‹"},{fn:next,side:"right",label:"›"}].map(({fn,side,label})=>(
              <button key={side} className="nav-btn" onClick={fn}
                style={{ position:"absolute", top:"50%", [side]:12, transform:"translateY(-50%)", width:36, height:36, borderRadius:"50%", background:"rgba(245,241,255,0.9)", border:"1.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", opacity:0, transition:"opacity 0.2s", fontSize:18, color:"var(--ink)", fontWeight:700 }}>
                {label}
              </button>
            ))}
            <div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", display:"flex", gap:5 }}>
              {images.map((_,i)=>(
                <button key={i} onClick={()=>setSelected(i)} style={{ width: i===selected ? 20 : 7, height:7, borderRadius:4, background: i===selected ? "var(--accent)" : "rgba(255,255,255,0.7)", border:"none", cursor:"pointer", transition:"all 0.2s", padding:0 }}/>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display:"flex", gap:8, overflowX:"auto" }}>
          {images.map((img,i) => (
            <button key={i} onClick={()=>setSelected(i)}
              style={{ flexShrink:0, width:72, height:72, borderRadius:12, overflow:"hidden", border: i===selected ? "2px solid var(--accent)" : "1.5px solid var(--border)", cursor:"pointer", padding:0, background:"none", transition:"border-color 0.2s" }}>
              <img src={img} alt={`${name} ${i+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
