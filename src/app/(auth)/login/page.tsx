"use client";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { preAuthCheck } from "../../actions/auth";
import { Eye, EyeOff, ArrowRight, Lock, Mail, ShoppingBag, MessageCircle, Shield, Zap, Package, Users } from "lucide-react";

const S = {
  page: { minHeight: "100vh", display: "flex", background: "var(--bg)" },
  left: {
    flex: "1 1 0", display: "flex", flexDirection: "column" as const,
    justifyContent: "center", padding: "60px 64px",
    background: "linear-gradient(135deg, #1A0F3C 0%, #2D1A5E 50%, #1A0F3C 100%)",
    position: "relative" as const, overflow: "hidden",
  },
  right: {
    width: "460px", flexShrink: 0, display: "flex", alignItems: "center",
    justifyContent: "center", padding: "40px 48px",
    background: "var(--bg-card)", borderLeft: "1.5px solid var(--border)",
  },
  card: { width: "100%", maxWidth: "360px" },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    background: "rgba(109,40,217,0.3)", border: "1px solid rgba(139,92,246,0.4)",
    borderRadius: 20, padding: "6px 14px", marginBottom: 28,
  },
  badgeDot: { width: 6, height: 6, borderRadius: "50%", background: "#A78BFA" },
  badgeText: { fontSize: 11, fontWeight: 700, color: "#C4B5FD", letterSpacing: "0.1em", textTransform: "uppercase" as const },
  headline: { fontSize: "clamp(32px,3.5vw,50px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-1.5px" },
  accent: { color: "#A78BFA" },
  sub: { fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 },
  featuresGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 36 },
  featureItem: {
    display: "flex", alignItems: "flex-start", gap: 10,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "12px 14px",
  },
  featureIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: "rgba(109,40,217,0.4)", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  featureTitle: { fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 },
  featureDesc: { fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 },
  techStack: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
  techBadge: {
    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
    background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  decorCircle1: {
    position: "absolute" as const, top: -80, right: -80,
    width: 320, height: 320, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(109,40,217,0.25) 0%, transparent 70%)",
    pointerEvents: "none" as const,
  },
  decorCircle2: {
    position: "absolute" as const, bottom: -60, left: -60,
    width: 240, height: 240, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
    pointerEvents: "none" as const,
  },
  logo: {
    width: 44, height: 44, background: "var(--accent)", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, fontSize: 22,
  },
  formTitle: { fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 4 },
  formSub: { fontSize: 13, color: "var(--ink-3)", marginBottom: 24 },
  err: { background: "#FEE2E2", border: "1px solid #FECACA", color: "#991B1B", padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 },
  label: { display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 6 },
  inputWrap: { position: "relative" as const },
  input: { width: "100%", padding: "11px 42px 11px 42px", background: "var(--bg-soft)", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--ink)", boxSizing: "border-box" as const, outline: "none" },
  icon: { position: "absolute" as const, left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", pointerEvents: "none" as const },
  eyeBtn: { position: "absolute" as const, right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: 3 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  forgotLink: { fontSize: 12, color: "var(--accent)", textDecoration: "none", fontWeight: 600 },
  submitBtn: { width: "100%", padding: "12px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  footer: { textAlign: "center" as const, fontSize: 13, color: "var(--ink-3)", marginTop: 18 },
  link: { color: "var(--accent)", fontWeight: 700, textDecoration: "none" },
  divider: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: "var(--ink-3)", fontSize: 12 },
  divLine: { flex: 1, height: 1, background: "var(--border)" },
};

const features = [
  { icon: ShoppingBag, title: "E-Commerce ครบวงจร", desc: "สินค้า ตะกร้า checkout order tracking" },
  { icon: Shield, title: "Security ระดับ Production", desc: "Brute-force lock, OTP, session timeout" },
  { icon: MessageCircle, title: "Real-time Chat (SSE)", desc: "ลูกค้าคุยกับ admin แบบ live" },
  { icon: Zap, title: "Admin Dashboard", desc: "Sales chart, จัดการ orders ทั้งหมด" },
  { icon: Package, title: "Inventory Management", desc: "Stock tracking, categories, image upload" },
  { icon: Users, title: "User Management", desc: "Role-based access, promote/ban/unlock" },
];

const techStack = ["Next.js 15", "TypeScript", "Prisma ORM", "PostgreSQL", "NextAuth v5", "Tailwind CSS", "SSE", "Docker", "Zod", "Recharts"];

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const check = await preAuthCheck(email, password);
    if (check.error) { setError(check.error); setLoading(false); return; }
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    else { router.push(callbackUrl); router.refresh(); }
    setLoading(false);
  };

  return (
    <div style={S.page}>
      {/* LEFT — Project Info */}
      <div style={S.left}>
        <div style={S.decorCircle1} />
        <div style={S.decorCircle2} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={S.badge}>
            <span style={S.badgeDot} />
            <span style={S.badgeText}>Full-Stack Portfolio Project</span>
          </div>
          <h1 style={S.headline}>
            MY<span style={S.accent}>STORE</span><br />
            <span style={{ fontSize: "0.55em", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 0 }}>
              E-Commerce Platform
            </span>
          </h1>
          <p style={S.sub}>
            ระบบร้านค้าออนไลน์ครบวงจร พัฒนาด้วย Next.js 15 App Router พร้อม Admin Panel, Real-time Chat และระบบ Security ระดับ Production
          </p>

          <div style={S.featuresGrid}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={S.featureItem}>
                <div style={S.featureIcon}>
                  <Icon size={15} color="#A78BFA" />
                </div>
                <div>
                  <p style={S.featureTitle}>{title}</p>
                  <p style={S.featureDesc}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={S.techStack}>
            {techStack.map(t => (
              <span key={t} style={S.techBadge}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div style={S.right}>
        <div style={S.card}>
          <div style={S.logo}>🛍️</div>
          <h2 style={S.formTitle}>ยินดีต้อนรับกลับ</h2>
          <p style={S.formSub}>เข้าสู่ระบบเพื่อดำเนินการต่อ</p>

          {error && <div style={S.err}>⚠️ {error}</div>}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={S.label}>อีเมล</label>
              <div style={S.inputWrap}>
                <Mail size={15} style={S.icon} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required style={S.input} />
              </div>
            </div>
            <div>
              <div style={S.row}>
                <label style={{ ...S.label, marginBottom: 0 }}>รหัสผ่าน</label>
                <Link href="/forgot-password" style={S.forgotLink}>ลืมรหัสผ่าน?</Link>
              </div>
              <div style={S.inputWrap}>
                <Lock size={15} style={S.icon} />
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={S.input} />
                <button type="button" style={S.eyeBtn} onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? "กำลังตรวจสอบ..." : <><span>เข้าสู่ระบบ</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={S.divider}><div style={S.divLine} /><span>หรือ</span><div style={S.divLine} /></div>
          <p style={S.footer}>ยังไม่มีบัญชี? <Link href="/register" style={S.link}>สมัครสมาชิก</Link></p>
          <p style={{ ...S.footer, marginTop: 8 }}>
            <Link href="/" style={{ ...S.link, color: "var(--ink-3)" }}>← กลับหน้าร้านค้า</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
