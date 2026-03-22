"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "../../../components/Toast";

const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Status = typeof statuses[number];

const badgeStyle: Record<Status, { bg: string; color: string }> = {
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  PAID:      { bg: "#DBEAFE", color: "#1E40AF" },
  SHIPPED:   { bg: "#EDE9FE", color: "#5B21B6" },
  DELIVERED: { bg: "#D1FAE5", color: "#065F46" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B" },
};

export default function ChangeStatusButton({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const update = async (status: Status) => {
    if (status === currentStatus) { setOpen(false); return; }
    setLoading(true); setOpen(false);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast(`อัปเดตเป็น ${status} แล้ว`); router.refresh(); }
    else toast("ไม่สำเร็จ", "error");
    setLoading(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        style={{
          background: "#1E1A2E", color: "#fff",
          padding: "8px 16px", borderRadius: "10px",
          fontSize: "12px", fontWeight: 700, cursor: "pointer",
          opacity: loading ? 0.6 : 1, border: "none",
        }}
      >
        {loading ? "กำลังอัปเดต..." : "เปลี่ยนสถานะ ▾"}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 6px)",
            background: "#fff", borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            border: "1px solid #DDD6F0", zIndex: 50,
            overflow: "hidden", minWidth: "160px",
          }}>
            {statuses.map((st) => {
              const s = badgeStyle[st];
              return (
                <button key={st} onClick={() => update(st)}
                  style={{
                    width: "100%", textAlign: "left", padding: "10px 14px",
                    fontSize: "12px", fontWeight: 700, cursor: "pointer", border: "none",
                    background: st === currentStatus ? s.bg : "transparent",
                    color: st === currentStatus ? s.color : "#4B4466",
                    borderBottom: "1px solid #F3F0F8",
                    display: "flex", alignItems: "center", gap: "8px",
                  }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, display: "inline-block" }} />
                  {st}
                  {st === currentStatus && <span style={{ marginLeft: "auto", opacity: 0.5 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
