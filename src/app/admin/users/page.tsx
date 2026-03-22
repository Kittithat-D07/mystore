import { prisma } from "../../../lib/prisma";
import UserActionButtons from "./UserActionButtons";
import { Users } from "lucide-react";

const th: React.CSSProperties = { padding:"10px 16px", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.12em", color:"var(--ink-3)", textAlign:"left" as const };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?:string }> }) {
  const { q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q ? { OR:[{ name:{contains:q,mode:"insensitive"} },{ email:{contains:q,mode:"insensitive"} }] } : {},
    include: { _count:{ select:{ orders:true } } }, orderBy:{ createdAt:"desc" },
  });
  const adminCount  = users.filter(u=>u.role==="ADMIN").length;
  const lockedCount = users.filter(u=>u.lockUntil && u.lockUntil>new Date()).length;

  return (
    <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, background:"var(--accent-l)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Users size={20} color="var(--accent)"/>
        </div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"var(--ink)" }}>Users</h1>
          <p style={{ fontSize:13, color:"var(--ink-3)" }}>{users.length} total · {adminCount} admin · {lockedCount} locked</p>
        </div>
      </div>

      <form method="GET" style={{ display:"flex", gap:10, maxWidth:400 }}>
        <input name="q" defaultValue={q} placeholder="Search by name or email..." style={{ flex:1, padding:"10px 16px", background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:14, color:"var(--ink)", outline:"none" }}/>
        <button type="submit" style={{ padding:"10px 20px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer" }}>Search</button>
      </form>

      <div style={{ background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"var(--bg-soft)", borderBottom:"1.5px solid var(--border)" }}>
            {["USER","ROLE","STATUS","ORDERS","JOINED","ACTIONS"].map(h=><th key={h} style={th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map(user => {
              const isLocked = user.lockUntil && user.lockUntil > new Date();
              return (
                <tr key={user.id} style={{ borderBottom:"1px solid var(--border-l)" }}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14, flexShrink:0 }}>
                        {(user.name||user.email||"U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight:700, color:"var(--ink)", fontSize:13 }}>{user.name||"—"}</p>
                        <p style={{ fontSize:11, color:"var(--ink-3)" }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:user.role==="ADMIN"?"var(--accent-l)":"var(--bg-soft)", color:user.role==="ADMIN"?"var(--accent)":"var(--ink-3)" }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20, display:"inline-block", width:"fit-content", background:user.isActive?"#D1FAE5":"#FEE2E2", color:user.isActive?"#065F46":"#991B1B" }}>
                        {user.isActive?"Active":"Inactive"}
                      </span>
                      {!user.emailVerified && <span style={{ fontSize:10, fontWeight:600, color:"#D97706" }}>Unverified</span>}
                      {isLocked && <span style={{ fontSize:10, fontWeight:600, color:"#DC2626" }}>Locked</span>}
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px", fontWeight:700, color:"var(--ink)", fontSize:14 }}>{user._count.orders}</td>
                  <td style={{ padding:"13px 16px", fontSize:12, color:"var(--ink-3)" }}>
                    {new Date(user.createdAt).toLocaleDateString("th-TH",{ day:"numeric", month:"short", year:"numeric" })}
                  </td>
                  <td style={{ padding:"13px 16px" }}><UserActionButtons userId={user.id} currentRole={user.role} isActive={user.isActive} isLocked={!!isLocked}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"var(--ink-3)", fontWeight:600 }}>ไม่พบ user</div>}
      </div>
    </div>
  );
}
