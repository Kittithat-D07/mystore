"use client";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/Toast";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!confirm("ยืนยันการยกเลิกคำสั่งซื้อ?")) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: "PUT" });
    if (res.ok) { toast("ยกเลิกคำสั่งซื้อแล้ว"); router.refresh(); }
    else { const d = await res.json(); toast(d.error || "ไม่สำเร็จ", "error"); }
  };

  return (
    <button onClick={handleCancel} className="text-xs font-black text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-all">
      ยกเลิก order
    </button>
  );
}
