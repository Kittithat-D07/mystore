"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Store, ExternalLink, MessageCircle } from "lucide-react";

const navItems = [
  { href:"/admin",            label:"Dashboard",  icon:LayoutDashboard },
  { href:"/admin/orders",     label:"Orders",     icon:ShoppingBag },
  { href:"/admin/categories", label:"Categories", icon:Tag },
  { href:"/admin/users",      label:"Users",      icon:Users },
  { href:"/admin/chat",       label:"Live Chat",  icon:MessageCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside style={{ width:220, background:"#1A0F3C", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0, borderRight:"1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"var(--accent)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Package size={18} color="#fff"/>
          </div>
          <div>
            <p style={{ fontWeight:800, color:"#fff", fontSize:14 }}>ShopAdmin</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>Dashboard</p>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:2 }}>
        {navItems.map(({ href, label, icon:Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10,
              textDecoration:"none", fontWeight:600, fontSize:13,
              background: active ? "rgba(109,40,217,0.3)" : "transparent",
              color: active ? "#C4B5FD" : "rgba(255,255,255,0.45)",
              borderLeft: active ? "2px solid #8B5CF6" : "2px solid transparent",
            }}>
              <Icon size={17}/>{label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding:"8px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <Link href="/" target="_blank" style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:10, textDecoration:"none", color:"rgba(255,255,255,0.35)", fontSize:13, fontWeight:600 }}>
          <Store size={15}/> View Store <ExternalLink size={11} style={{ marginLeft:"auto" }}/>
        </Link>
        <button onClick={()=>signOut({callbackUrl:"/login"})} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:10, background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.3)", fontSize:13, fontWeight:600 }}>
          <LogOut size={15}/> Sign Out
        </button>
      </div>
    </aside>
  );
}
