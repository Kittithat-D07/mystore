"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

const S = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"var(--bg)" },
  card: { width:"100%", maxWidth:"420px", background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:"24px", padding:"40px", boxShadow:"0 8px 40px rgba(109,40,217,0.10)" },
  logo: { width:48, height:48, background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"22px" },
  h1: { textAlign:"center" as const, fontSize:"24px", fontWeight:800, color:"var(--ink)", marginBottom:"6px" },
  sub: { textAlign:"center" as const, fontSize:"14px", color:"var(--ink-3)", marginBottom:"28px" },
  label: { display:"block", fontSize:"11px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.1em", color:"var(--ink-3)", marginBottom:"6px" },
  wrap: { position:"relative" as const },
  input: { width:"100%", padding:"12px 16px 12px 42px", background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:"12px", fontSize:"14px", fontWeight:500, color:"var(--ink)", boxSizing:"border-box" as const },
  icon: { position:"absolute" as const, left:13, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" as const },
  btn: { width:"100%", padding:"13px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:"12px", fontSize:"15px", fontWeight:700, cursor:"pointer" },
  err: { background:"#FEE2E2", border:"1px solid #FECACA", color:"#991B1B", padding:"12px", borderRadius:"12px", fontSize:"13px", fontWeight:600, marginBottom:"16px" },
  back: { display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"var(--ink-3)", textDecoration:"none", fontWeight:600, marginBottom:20 },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]       = useState<1|2|3>(1);
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [newPw, setNewPw]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const step1 = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/auth/forgot-password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email}) });
    const d = await res.json(); setLoading(false);
    if (!res.ok) { setError(d.error||"เกิดข้อผิดพลาด"); return; }
    if (d.otp) setMockOtp(d.otp);
    setStep(2);
  };
  const step2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length<6) { setError("กรุณากรอก OTP ให้ครบ"); return; }
    setError(""); setStep(3);
  };
  const step3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw!==confirm) { setError("รหัสผ่านไม่ตรงกัน"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/reset-password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,otp,newPassword:newPw}) });
    const d = await res.json(); setLoading(false);
    if (!res.ok) { setError(d.error||"ไม่สำเร็จ"); return; }
    router.push("/login");
  };

  const titles = ["ลืมรหัสผ่าน?", "ยืนยัน OTP", "ตั้งรหัสผ่านใหม่"];
  const subs   = ["กรอกอีเมลเพื่อรับ OTP", `ส่งไปที่ ${email}`, "ตั้งรหัสผ่านใหม่ของคุณ"];

  return (
    <div style={S.page}>
      <div style={S.card}>
        <Link href="/login" style={S.back}><ArrowLeft size={14}/>กลับไปหน้า Login</Link>
        <div style={S.logo}>{step===3?"🔐":"📧"}</div>
        <h1 style={S.h1}>{titles[step-1]}</h1>
        <p style={S.sub}>{subs[step-1]}</p>
        {error && <div style={S.err}>⚠️ {error}</div>}

        {step===1 && (
          <form onSubmit={step1} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <label style={S.label}>อีเมล</label>
              <div style={S.wrap}>
                <Mail size={15} style={S.icon}/>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={S.input}/>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{...S.btn,opacity:loading?0.7:1}}>
              {loading?"กำลังส่ง...":"ส่ง OTP"}
            </button>
          </form>
        )}

        {step===2 && (
          <form onSubmit={step2} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {mockOtp && (
              <div style={{ background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:14, padding:16, textAlign:"center" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Mock OTP</p>
                <p style={{ fontSize:32, fontWeight:800, letterSpacing:"0.3em", color:"var(--accent)", fontFamily:"monospace" }}>{mockOtp}</p>
              </div>
            )}
            <div>
              <label style={{...S.label, textAlign:"center"}}>OTP 6 หลัก</label>
              <input type="text" required maxLength={6} value={otp} autoFocus
                onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}
                placeholder="------"
                style={{ ...S.input, paddingLeft:14, textAlign:"center", fontSize:28, letterSpacing:"0.4em" }}/>
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:i<otp.length?"var(--accent)":"var(--bg-deep)" }}/>
                ))}
              </div>
            </div>
            <button type="submit" disabled={otp.length<6} style={{...S.btn, background:otp.length===6?"var(--accent)":"var(--bg-deep)"}}>
              ยืนยัน OTP
            </button>
            <button type="button" onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)", fontSize:13, fontWeight:600 }}>
              ← ส่ง OTP ใหม่
            </button>
          </form>
        )}

        {step===3 && (
          <form onSubmit={step3} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[{label:"รหัสผ่านใหม่",val:newPw,set:setNewPw,ph:"อย่างน้อย 6 ตัวอักษร"},{label:"ยืนยันรหัสผ่าน",val:confirm,set:setConfirm,ph:"พิมพ์ซ้ำอีกครั้ง"}].map(({label,val,set,ph})=>(
              <div key={label}>
                <label style={S.label}>{label}</label>
                <div style={S.wrap}>
                  <Lock size={15} style={S.icon}/>
                  <input type={showPw?"text":"password"} required value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={S.input}/>
                  <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)" }}>
                    {showPw?<EyeOff size={17}/>:<Eye size={17}/>}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{...S.btn,opacity:loading?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?"กำลังบันทึก...":<><CheckCircle size={16}/><span>บันทึกรหัสผ่านใหม่</span></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
