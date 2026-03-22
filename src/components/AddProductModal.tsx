"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploaderLocal from "./ImageUploaderLocal";
import { useToast } from "./Toast";
import { Plus, X, PackagePlus } from "lucide-react";

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", stock: "", sku: "", description: "", categoryId: "" });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.sku) {
      toast("กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          stock: parseInt(formData.stock) || 0,
          categoryId: formData.categoryId || null,
          images,
        }),
      });
      if (res.ok) {
        toast(`สร้างสินค้า "${formData.name}" สำเร็จ`);
        setIsOpen(false);
        router.refresh();
        setFormData({ name: "", price: "", stock: "", sku: "", description: "", categoryId: "" });
        setImages([]);
      }
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 15px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: "bold", outline: "none", backgroundColor: "#fff" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "5px", marginLeft: "4px" };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} style={{ backgroundColor: "#0f172a", color: "#fff", padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
      <Plus size={18} /> เพิ่มสินค้า
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: "550px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        <div style={{ padding: "20px 30px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#1e293b", margin: 0 }}>Add New Product</h2>
          <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: "pointer", color: "#94a3b8" }} />
        </div>
        <div style={{ padding: "30px", overflowY: "auto", maxHeight: "70vh" }}>
          <ImageUploaderLocal onUploadSuccess={setImages} />
          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Product Name *</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} placeholder="ชื่อสินค้า..." />
          </div>
          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Price (฿) *</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>SKU *</label><input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Category</label><select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} style={inputStyle}><option value="">เลือกหมวดหมู่</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div style={{ marginTop: "15px" }}>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: "100px", resize: "none" }} />
          </div>
        </div>
        <div style={{ padding: "20px 30px", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
          <button onClick={() => setIsOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", color: "#64748b", cursor: "pointer" }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", color: "#fff", backgroundColor: "#0d9488", cursor: "pointer" }}>{loading ? "กำลังบันทึก..." : "ยืนยันการเพิ่มสินค้า"}</button>
        </div>
      </div>
    </div>
  );
}