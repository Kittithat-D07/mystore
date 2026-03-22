"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, LogOut, Store, LayoutDashboard, User, Package, Search, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { router.push(`/?q=${encodeURIComponent(q.trim())}`); setSearchOpen(false); setQ(""); }
  };

  const iBtn: React.CSSProperties = { background:"none", border:"none", cursor:"pointer", padding:8, borderRadius:10, color:"var(--ink-2)", display:"flex", alignItems:"center" };
  const aBtn: React.CSSProperties = { ...iBtn, background:"var(--accent-l)", color:"var(--accent)" };

  return (
    <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 24px", position:"sticky", top:0, zIndex:50, background:"var(--bg-card)", borderBottom:"1.5px solid var(--border)" }}>
      <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}>
        <div style={{ width:36, height:36, background:"var(--accent)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Store size={18} color="#fff"/>
        </div>
        <span style={{ fontWeight:900, fontSize:17, color:"var(--ink)", letterSpacing:"-0.5px" }}>MYSTORE</span>
      </Link>

      {searchOpen ? (
        <form onSubmit={handleSearch} style={{ flex:1, margin:"0 16px", display:"flex", gap:8 }}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="ค้นหาสินค้า..."
            style={{ flex:1, padding:"9px 16px", background:"var(--bg-soft)", border:"1.5px solid var(--accent)", borderRadius:10, fontSize:14, color:"var(--ink)", outline:"none" }}/>
          <button type="submit" style={{ padding:"9px 16px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>ค้นหา</button>
          <button type="button" onClick={()=>setSearchOpen(false)} style={iBtn}><X size={18}/></button>
        </form>
      ) : (
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <button onClick={()=>setSearchOpen(true)} style={iBtn}><Search size={20}/></button>
          {session?.user?.role==="ADMIN" && (
            <Link href="/admin" style={pathname.startsWith("/admin")?aBtn:iBtn}><LayoutDashboard size={20}/></Link>
          )}
          <Link href="/cart" style={{ ...iBtn, position:"relative" }}>
            <ShoppingCart size={20}/>
            {cartCount>0 && <span style={{ position:"absolute", top:2, right:2, background:"var(--accent)", color:"#fff", fontSize:9, fontWeight:800, minWidth:16, height:16, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", border:"2px solid var(--bg-card)" }}>{cartCount>9?"9+":cartCount}</span>}
          </Link>
          {session?.user ? (
            <>
              <div style={{ width:1, height:18, background:"var(--border)", margin:"0 3px" }}/>
              <Link href="/profile" style={pathname==="/profile"?aBtn:iBtn}><User size={20}/></Link>
              <Link href="/orders"  style={pathname==="/orders" ?aBtn:iBtn}><Package size={20}/></Link>
              <button onClick={()=>signOut({callbackUrl:"/login"})} style={{ ...iBtn, color:"var(--ink-3)" }}><LogOut size={18}/></button>
            </>
          ) : (
            <Link href="/login" style={{ marginLeft:6, padding:"9px 18px", background:"var(--accent)", color:"#fff", borderRadius:10, fontWeight:700, fontSize:13, textDecoration:"none" }}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
