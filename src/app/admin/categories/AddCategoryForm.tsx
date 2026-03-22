"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/Toast";
import { Plus } from "lucide-react";

export default function AddCategoryForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      toast(`Category "${name}" created`);
      setName("");
      setOpen(false);
      router.refresh();
    } else {
      toast(data.error || "Failed", "error");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all"
      >
        <Plus size={16} /> Add Category
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name..."
        className="px-4 py-2.5 bg-white border-2 border-teal-500 rounded-xl text-sm font-bold text-slate-900 outline-none w-48"
      />
      <button type="submit" disabled={loading} className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold disabled:opacity-50">
        {loading ? "..." : "Add"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold">
        Cancel
      </button>
    </form>
  );
}
