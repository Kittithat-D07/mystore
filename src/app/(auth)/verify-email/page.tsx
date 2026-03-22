"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email") || "";

  const getNewOtp = async () => {
    if (!userEmail) return;
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await res.json();
    if (data.otp) setMockOtp(data.otp);
  };

  useEffect(() => {
    getNewOtp();
  }, [userEmail]);

  const handleConfirm = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, otp }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "OTP ไม่ถูกต้อง");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#9C27B0] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Verify your email</h1>
        <p className="text-slate-500 font-medium text-sm">{userEmail}</p>

        {mockOtp && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl">
            <p className="text-orange-600 font-bold text-sm">
              🛠️ Developer Mock Mode — OTP:{" "}
              <span className="font-black text-xl tracking-widest">{mockOtp}</span>
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm font-bold rounded-r-xl">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full text-center text-3xl font-mono font-black tracking-widest py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-purple-500"
          placeholder="------"
        />

        <button
          onClick={handleConfirm}
          disabled={loading || otp.length < 6}
          className="w-full bg-[#D500F9] hover:bg-[#AA00FF] text-white py-5 rounded-2xl font-black text-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Confirm Verification"}
        </button>

        <button
          onClick={getNewOtp}
          className="text-sm text-purple-600 font-bold hover:underline"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#9C27B0] flex items-center justify-center"><div className="text-white font-bold">Loading...</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
