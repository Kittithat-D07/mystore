"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "../../../components/Toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Lock, Save } from "lucide-react";

const inp: React.CSSProperties = { width:"100%", padding:"11px 16px", background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:14, color:"var(--ink)", fontWeight:500, boxSizing:"border-box" };
const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:18, padding:24 };
const lbl: React.CSSProperties = { display:"block", fontSize:11, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.1em", color:"var(--ink-3)", marginBottom:6 };
const btn: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, padding:"10px 20px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer" };

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [pw, setPw] = useState({ current:"", newPw:"", confirm:"" });
  const [loadingName, setLoadingName] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);

  if (!session?.user) { router.push("/login?callbackUrl=/profile"); return null; }

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast("กรุณากรอกชื่อ","error"); return; }
    setLoadingName(true);
    const res = await fetch("/api/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name}) });
    if (res.ok) { await update({name}); toast("อัปเดตชื่อสำเร็จ"); }
    else { const d = await res.json(); toast(d.error||"ไม่สำเร็จ","error"); }
    setLoadingName(false);
  };

  const savePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPw!==pw.confirm) { toast("รหัสผ่านไม่ตรงกัน","error"); return; }
    if (pw.newPw.length<6) { toast("รหัสผ่านต้องมีอย่างน้อย 6 ตัว","error"); return; }
    setLoadingPw(true);
    const res = await fetch("/api/profile", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({currentPassword:pw.current,newPassword:pw.newPw}) });
    if (res.ok) { toast("เปลี่ยนรหัสผ่านสำเร็จ"); setPw({current:"",newPw:"",confirm:""}); }
    else { const d = await res.json(); toast(d.error||"ไม่สำเร็จ","error"); }
    setLoadingPw(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"40px 24px" }}>
      <div style={{ maxWidth:520, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/" style={{ padding:8, background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:10, display:"flex", color:"var(--ink-3)", textDecoration:"none" }}><ArrowLeft size={18}/></Link>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--ink)" }}>โปรไฟล์ของฉัน</h1>
            <p style={{ fontSize:13, color:"var(--ink-3)" }}>{session.user.email}</p>
          </div>
        </div>

        {/* Avatar */}
        <div style={{ ...card, display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:56, height:56, background:"var(--accent)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:22, flexShrink:0 }}>
            {(session.user.name||session.user.email||"U")[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:16, color:"var(--ink)" }}>{session.user.name||"ไม่มีชื่อ"}</p>
            <p style={{ fontSize:13, color:"var(--ink-3)" }}>{session.user.email}</p>
            <span style={{ display:"inline-block", marginTop:4, fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, background:"var(--accent-light)", color:"var(--accent)" }}>{session.user.role}</span>
          </div>
        </div>

        {/* Name */}
        <div style={card}>
          <h2 style={{ fontWeight:800, fontSize:15, color:"var(--ink)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><User size={15} color="var(--accent)"/>แก้ไขชื่อ</h2>
          <form onSubmit={saveName} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><label style={lbl}>ชื่อ-นามสกุล</label><input value={name} onChange={e=>setName(e.target.value)} style={inp} placeholder="ชื่อของคุณ"/></div>
            <button type="submit" disabled={loadingName} style={{...btn, opacity:loadingName?0.7:1}}><Save size={14}/>{loadingName?"กำลังบันทึก...":"บันทึกชื่อ"}</button>
          </form>
        </div>

        {/* Password */}
        <div style={card}>
          <h2 style={{ fontWeight:800, fontSize:15, color:"var(--ink)", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}><Lock size={15} color="var(--accent)"/>เปลี่ยนรหัสผ่าน</h2>
          <form onSubmit={savePw} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[{l:"รหัสผ่านปัจจุบัน",k:"current",ph:"••••••••"},{l:"รหัสผ่านใหม่",k:"newPw",ph:"อย่างน้อย 6 ตัว"},{l:"ยืนยันรหัสผ่านใหม่",k:"confirm",ph:"พิมพ์ซ้ำ"}].map(({l,k,ph})=>(
              <div key={k}><label style={lbl}>{l}</label><input type="password" value={(pw as any)[k]} onChange={e=>setPw({...pw,[k]:e.target.value})} style={inp} placeholder={ph}/></div>
            ))}
            <button type="submit" disabled={loadingPw} style={{...btn,opacity:loadingPw?0.7:1}}><Lock size={14}/>{loadingPw?"กำลังเปลี่ยน...":"เปลี่ยนรหัสผ่าน"}</button>
          </form>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          {[{href:"/orders",label:"คำสั่งซื้อของฉัน",sub:"ดูประวัติ"},{href:"/",label:"กลับหน้าร้าน",sub:"เลือกสินค้า"}].map(({href,label,sub})=>(
            <Link key={href} href={href} style={{ flex:1, ...card, textDecoration:"none", textAlign:"center" as const, padding:16 }}>
              <p style={{ fontWeight:700, color:"var(--ink)", fontSize:14 }}>{label}</p>
              <p style={{ fontSize:12, color:"var(--ink-3)", marginTop:2 }}>{sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
