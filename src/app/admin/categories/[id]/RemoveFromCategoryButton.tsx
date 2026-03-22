"use client";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../components/Toast";
import { X } from "lucide-react";

export default function RemoveFromCategoryButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleRemove = async () => {
    if (!confirm(`นำ "${productName}" ออกจากหมวดหมู่นี้?\n(สินค้าจะยังอยู่ในระบบ แค่ไม่มี category)`)
    ) return;

    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeCategoryOnly: true }),
    });

    if (res.ok) {
      toast(`นำ "${productName}" ออกจากหมวดหมู่แล้ว`);
      router.refresh();
    } else {
      toast("ไม่สำเร็จ", "error");
    }
  };

  return (
    <button
      onClick={handleRemove}
      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 rounded-lg font-black text-xs transition-all border border-transparent hover:border-red-200"
    >
      <X size={13} />
      นำออกจากหมวดหมู่
    </button>
  );
}
