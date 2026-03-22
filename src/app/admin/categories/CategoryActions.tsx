"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/Toast";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function CategoryActions({
  categoryId, categoryName, productCount,
}: {
  categoryId: string;
  categoryName: string;
  productCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(categoryName);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = async () => {
    if (!name.trim() || name === categoryName) { setEditing(false); return; }
    setLoading(true);
    const res = await fetch(`/api/categories/${categoryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) { toast("Category updated"); router.refresh(); }
    else toast("Failed to update", "error");
    setEditing(false);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${categoryName}"? ${productCount > 0 ? `${productCount} products will be uncategorized.` : ""}`)) return;
    setLoading(true);
    const res = await fetch(`/api/categories/${categoryId}`, { method: "DELETE" });
    if (res.ok) { toast("Category deleted"); router.refresh(); }
    else toast("Failed to delete", "error");
    setLoading(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleEdit(); if (e.key === "Escape") setEditing(false); }}
          className="px-2 py-1 border-2 border-teal-500 rounded-lg text-sm font-bold text-slate-900 outline-none w-32"
        />
        <button onClick={handleEdit} disabled={loading} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg">
          <Check size={14} />
        </button>
        <button onClick={() => { setEditing(false); setName(categoryName); }} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setEditing(true)} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
        <Pencil size={15} />
      </button>
      <button onClick={handleDelete} disabled={loading} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
