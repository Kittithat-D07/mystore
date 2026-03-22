"use client";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/Toast";

export default function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const toggle = async () => {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) { toast(isActive ? "ปิดสินค้าแล้ว" : "เปิดสินค้าแล้ว"); router.refresh(); }
    else toast("ไม่สำเร็จ", "error");
  };

  return (
    <button onClick={toggle} className={`relative w-10 h-5 rounded-full transition-all ${isActive ? "bg-teal-500" : "bg-slate-200"}`} title={isActive ? "คลิกเพื่อปิด" : "คลิกเพื่อเปิด"}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isActive ? "left-5" : "left-0.5"}`} />
    </button>
  );
}
