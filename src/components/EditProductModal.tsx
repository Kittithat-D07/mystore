"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploaderLocal from "./ImageUploaderLocal";
import { useToast } from "./Toast";
import { Pencil, X, Edit3 } from "lucide-react";

export default function EditProductModal({ product }: { product: any }) {
  const [isOpen, setIsOpen] = useState(false);
  // 🚩 Edit ต้องเอาค่าจาก product ที่ส่งมาเป็น Default
  const [formData, setFormData] = useState({
    name: product.name, 
    price: product.price, 
    stock: product.stock,
    sku: product.sku || "", 
    description: product.description || "",
    categoryId: product.categoryId || "",
  });
  const [images, setImages] = useState<string[]>(product.images || []);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) fetch("/api/categories").then(r => r.json()).then(setCategories).catch(() => {});
  }, [isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT", // 🚩 Edit ใช้ PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images }),
      });
      if (res.ok) { 
        toast("อัปเดตข้อมูลสินค้าเรียบร้อย"); 
        setIsOpen(false); 
        router.refresh(); 
      }
    } finally { setLoading(false); }
  };

  // --- Common Styles ---
  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 15px", borderRadius: "12px", border: "1.5px solid #e2e8f0", fontSize: "14px", fontWeight: "bold", outline: "none", backgroundColor: "#fff" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "5px", marginLeft: "4px" };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)} 
      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", color: "#475569" }}
    >
      <Pencil size={13} /> Edit
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
      <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: "550px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
        
        {/* Header */}
        <div style={{ padding: "20px 30px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ padding: "8px", backgroundColor: "#dbeafe", color: "#2563eb", borderRadius: "8px", display: "flex" }}><Edit3 size={20} /></div>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#1e293b", margin: 0 }}>Edit Product</h2>
          </div>
          <X size={20} onClick={() => setIsOpen(false)} style={{ cursor: "pointer", color: "#94a3b8" }} />
        </div>

        {/* Body */}
        <div style={{ padding: "30px", overflowY: "auto", maxHeight: "70vh" }}>
          <ImageUploaderLocal onUploadSuccess={setImages} existingImages={images} />
          
          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Product Name *</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>Price (฿) *</label><input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={inputStyle} /></div>
            <div style={{ flex: 1 }}><label style={labelStyle}>Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={inputStyle} /></div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
            <div style={{ flex: 1 }}><label style={labelStyle}>SKU *</label><input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={inputStyle} /></div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Category</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} style={inputStyle}>
                <option value="">เลือกหมวดหมู่</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <label style={labelStyle}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ ...inputStyle, minHeight: "100px", resize: "none" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 30px", backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
          <button onClick={() => setIsOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", color: "#64748b", cursor: "pointer", backgroundColor: "transparent" }}>ยกเลิก</button>
          <button onClick={handleSubmit} style={{ flex: 2, padding: "12px", borderRadius: "12px", border: "none", fontWeight: "bold", color: "#fff", backgroundColor: "#2563eb", cursor: "pointer" }}>
            {loading ? "กำลังบันทึก..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}