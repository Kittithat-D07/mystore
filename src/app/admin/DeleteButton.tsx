"use client";
import { useRouter } from "next/navigation";
import { useToast } from "../../components/Toast";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("ลบสินค้านี้? รูปภาพทั้งหมดจะถูกลบด้วย")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { toast("ลบสินค้าเรียบร้อยแล้ว"); router.refresh(); }
    else toast("ไม่สามารถลบได้", "error");
  };

  return (
    <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg font-black text-xs transition-all border border-red-100">
      <Trash2 size={13} /> ลบ
    </button>
  );
}
