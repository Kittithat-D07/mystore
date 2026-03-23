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
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--accent)", color: "#fff",
          padding: "10px 20px", borderRadius: 12,
          fontWeight: 700, fontSize: 13, border: "none",
          cursor: "pointer", boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
          transition: "opacity 0.2s, transform 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        onMouseDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
        onMouseUp={e => (e.currentTarget.style.transform = "")}
      >
        <Plus size={15} /> + Add Category
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="ชื่อหมวดหมู่..."
        style={{
          padding: "10px 16px", background: "var(--bg-card)",
          border: "2px solid var(--accent)", borderRadius: 10,
          fontSize: 13, fontWeight: 600, color: "var(--ink)",
          outline: "none", width: 200,
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "10px 18px", background: "var(--accent)", color: "#fff",
          border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "กำลังเพิ่ม..." : "เพิ่ม"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setName(""); }}
        style={{
          padding: "10px 16px", background: "var(--bg-soft)", color: "var(--ink-3)",
          border: "1.5px solid var(--border)", borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >
        ยกเลิก
      </button>
    </form>
  );
}
