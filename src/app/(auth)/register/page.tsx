"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";

const S = {
  page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"var(--bg)" },
  card: { width:"100%", maxWidth:"440px", background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:"24px", padding:"40px", boxShadow:"0 8px 40px rgba(109,40,217,0.10)" },
  logo: { width:48, height:48, background:"var(--accent)", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"22px" },
  h1: { textAlign:"center" as const, fontSize:"24px", fontWeight:800, color:"var(--ink)", marginBottom:"6px" },
  sub: { textAlign:"center" as const, fontSize:"14px", color:"var(--ink-3)", marginBottom:"28px" },
  label: { display:"block", fontSize:"11px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.1em", color:"var(--ink-3)", marginBottom:"6px" },
  wrap: { position:"relative" as const },
  input: { width:"100%", padding:"12px 16px 12px 42px", background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:"12px", fontSize:"14px", fontWeight:500, color:"var(--ink)", boxSizing:"border-box" as const },
  icon: { position:"absolute" as const, left:13, top:"50%", transform:"translateY(-50%)", color:"var(--ink-3)", pointerEvents:"none" as const },
  eye: { position:"absolute" as const, right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)" },
  btn: { width:"100%", padding:"13px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:"12px", fontSize:"15px", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  err: { background:"#FEE2E2", border:"1px solid #FECACA", color:"#991B1B", padding:"12px 16px", borderRadius:"12px", fontSize:"13px", fontWeight:600, marginBottom:"16px" },
  link: { color:"var(--accent)", fontWeight:700, textDecoration:"none" },
  footer: { textAlign:"center" as const, fontSize:"13px", color:"var(--ink-3)", marginTop:"20px" },
  steps: { display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:"24px" },
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep]         = useState<1|2>(1);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [mockOtp, setMockOtp]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [otp, setOtp]           = useState("");
  const [form, setForm]         = useState({ name:"", email:"", password:"" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) setError(data.error || "เกิดข้อผิดพลาด");
    else { setMockOtp(data.otp); setStep(2); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/auth/verify", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ email:form.email, otp }) });
    const data = await res.json(); setLoading(false);
    if (!res.ok) setError(data.error || "OTP ไม่ถูกต้อง");
    else router.push("/login");
  };

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>✨</div>
        <h1 style={S.h1}>{step===1?"สร้างบัญชีใหม่":"ยืนยันอีเมล"}</h1>
        <p style={S.sub}>{step===1?"เริ่มต้นช้อปปิ้งได้เลย":`ส่ง OTP ไปที่ ${form.email}`}</p>

        {/* Step indicator */}
        <div style={S.steps}>
          {[1,2].map(n=>(
            <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:step>=n?"var(--accent)":"var(--bg-soft)", color:step>=n?"#fff":"var(--ink-3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, border:`1.5px solid ${step>=n?"var(--accent)":"var(--border)"}` }}>
                {step>n ? "✓" : n}
              </div>
              {n<2 && <div style={{ width:40, height:2, background:step>n?"var(--accent)":"var(--border)", borderRadius:1 }} />}
            </div>
          ))}
        </div>

        {error && <div style={S.err}>⚠️ {error}</div>}

        {step===1 && (
          <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { icon:User,  label:"ชื่อ-นามสกุล", key:"name",     type:"text",     ph:"กรอกชื่อของคุณ" },
              { icon:Mail,  label:"อีเมล",         key:"email",    type:"email",    ph:"your@email.com" },
              { icon:Lock,  label:"รหัสผ่าน",      key:"password", type:showPw?"text":"password", ph:"อย่างน้อย 6 ตัวอักษร" },
            ].map(({ icon:Icon, label, key, type, ph }) => (
              <div key={key}>
                <label style={S.label}>{label}</label>
                <div style={S.wrap}>
                  <Icon size={15} style={S.icon} />
                  <input type={type} required value={(form as any)[key]}
                    onChange={e=>setForm({...form,[key]:e.target.value})}
                    placeholder={ph} style={S.input} minLength={key==="password"?6:undefined} />
                  {key==="password" && (
                    <button type="button" style={S.eye} onClick={()=>setShowPw(!showPw)}>
                      {showPw?<EyeOff size={17}/>:<Eye size={17}/>}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} style={{...S.btn, opacity:loading?0.7:1, marginTop:4}}>
              {loading?"กำลังสร้าง...":<><span>สร้างบัญชี</span><ArrowRight size={17}/></>}
            </button>
          </form>
        )}

        {step===2 && (
          <form onSubmit={handleVerify} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {mockOtp && (
              <div style={{ background:"var(--bg-soft)", border:"1.5px solid var(--border)", borderRadius:14, padding:"16px", textAlign:"center" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Mock OTP</p>
                <p style={{ fontSize:32, fontWeight:800, letterSpacing:"0.3em", color:"var(--accent)", fontFamily:"monospace" }}>{mockOtp}</p>
              </div>
            )}
            <div>
              <label style={{...S.label, textAlign:"center"}}>กรอก OTP 6 หลัก</label>
              <input type="text" required maxLength={6} value={otp} autoFocus
                onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}
                placeholder="------"
                style={{ ...S.input, textAlign:"center", fontSize:28, letterSpacing:"0.4em", padding:"14px", paddingLeft:"14px" }} />
              <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:8 }}>
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:i<otp.length?"var(--accent)":"var(--bg-deep)", transition:"background 0.2s" }} />
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading||otp.length<6} style={{...S.btn, background:otp.length===6?"var(--accent)":"var(--bg-deep)", opacity:loading?0.7:1}}>
              {loading?"กำลังยืนยัน...":<><CheckCircle size={17}/><span>ยืนยัน OTP</span></>}
            </button>
            <button type="button" onClick={()=>setStep(1)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--ink-3)", fontSize:13, fontWeight:600 }}>
              ← กลับแก้ไขข้อมูล
            </button>
          </form>
        )}

        <p style={S.footer}>มีบัญชีอยู่แล้ว? <Link href="/login" style={S.link}>เข้าสู่ระบบ</Link></p>
      </div>
    </div>
  );
}
