import { prisma } from "../../lib/prisma";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";

export const revalidate = 30;

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ category?: string; q?: string }> }) {
  const sp = await searchParams;
  const sel = sp?.category || "";
  const q   = sp?.q || "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(q ? { OR:[{ name:{contains:q,mode:"insensitive"} },{ description:{contains:q,mode:"insensitive"} }] } : {}),
        ...(sel ? { category:{ name:sel } } : {}),
      },
      include: { category:true }, orderBy: { createdAt:"desc" },
    }),
    prisma.category.findMany({ include:{ _count:{ select:{ products:{ where:{ isActive:true } } } } }, orderBy:{ name:"asc" } }),
  ]);

  const isFiltered = q || sel;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Hero */}
      {!isFiltered && (
        <header style={{ background:"var(--bg-card)", borderBottom:"1.5px solid var(--border)", padding:"60px 24px 52px", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(var(--accent) 1.5px, transparent 1.5px)", backgroundSize:"24px 24px", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:560, margin:"0 auto" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--accent-l)", border:"1.5px solid var(--border-l)", borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:700, color:"var(--accent)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:22 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", display:"inline-block" }}/>
              {products.length} สินค้าพร้อมจัดส่ง
            </div>
            <h1 style={{ fontSize:"clamp(44px,8vw,88px)", fontWeight:900, color:"var(--ink)", lineHeight:1, letterSpacing:"-3px", marginBottom:14 }}>
              MY<span style={{ color:"var(--accent)" }}>STORE</span>
            </h1>
            <p style={{ fontSize:16, color:"var(--ink-3)", fontWeight:500 }}>สินค้าคุณภาพ ส่งตรงถึงบ้านคุณ</p>
          </div>
        </header>
      )}

      {/* Category bar */}
      <div style={{ background:"var(--bg-card)", borderBottom:"1.5px solid var(--border)", padding:"10px 24px", display:"flex", gap:8, overflowX:"auto", position:"sticky", top:0, zIndex:30 }}>
        <Link href="/" style={{ flexShrink:0, padding:"7px 16px", borderRadius:20, fontSize:13, fontWeight:700, textDecoration:"none", background:!sel&&!q?"var(--accent)":"var(--bg-soft)", color:!sel&&!q?"#fff":"var(--ink-2)", border:"1.5px solid transparent" }}>
          ทั้งหมด
        </Link>
        {categories.map(cat => (
          <Link key={cat.id} href={sel===cat.name ? "/" : `/?category=${encodeURIComponent(cat.name)}`}
            style={{ flexShrink:0, padding:"7px 16px", borderRadius:20, fontSize:13, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap", background:sel===cat.name?"var(--accent)":"var(--bg-soft)", color:sel===cat.name?"#fff":"var(--ink-2)" }}>
            {cat.name} <span style={{ opacity:0.5, marginLeft:3 }}>{cat._count.products}</span>
          </Link>
        ))}
      </div>

      <main style={{ maxWidth:1280, margin:"0 auto", padding:"40px 24px" }}>
        {q && (
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:14, padding:"14px 18px", marginBottom:28 }}>
            <Search size={18} color="var(--ink-3)"/>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, color:"var(--ink)", fontSize:14 }}>ผลการค้นหา "{q}"</p>
              <p style={{ fontSize:12, color:"var(--ink-3)" }}>{products.length} รายการ</p>
            </div>
            <Link href="/" style={{ fontSize:12, color:"var(--ink-3)", fontWeight:700, textDecoration:"none" }}>ล้าง ×</Link>
          </div>
        )}
        {!q && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:32 }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:"var(--ink)" }}>{sel || "สินค้าทั้งหมด"}</h2>
            <p style={{ fontSize:13, color:"var(--ink-3)" }}>{products.length} รายการ</p>
          </div>
        )}

        {products.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <p style={{ fontSize:48, marginBottom:16 }}>🔍</p>
            <p style={{ fontSize:20, fontWeight:800, color:"var(--ink)", marginBottom:8 }}>ไม่พบสินค้า</p>
            <p style={{ color:"var(--ink-3)", marginBottom:24 }}>ลองค้นหาด้วยคำอื่น</p>
            <Link href="/" style={{ padding:"11px 24px", background:"var(--accent)", color:"#fff", borderRadius:12, fontWeight:700, fontSize:14, textDecoration:"none" }}>ดูสินค้าทั้งหมด</Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"32px 20px" }}>
            {products.map(p => <ProductCard key={p.id} p={p}/>)}
          </div>
        )}
      </main>
    </div>
  );
}
