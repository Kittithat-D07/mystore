"use client";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../../../components/Toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, MapPin, Phone, User, Package, CreditCard } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!form.name || !form.phone || !form.address) { toast("กรุณากรอกข้อมูลให้ครบ", "error"); return; }
    if (cart.length === 0) { toast("ไม่มีสินค้าในตะกร้า", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ id: i.id, price: i.price, quantity: i.quantity })),
          totalAmount: totalPrice,
          shippingName: form.name,
          shippingPhone: form.phone,
          shippingAddress: form.address,
        }),
      });
      if (res.ok) { setIsOrdered(true); clearCart(); }
      else { const d = await res.json(); toast(d.error || "ไม่สามารถสั่งซื้อได้", "error"); }
    } catch (err) { toast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error"); }
    setLoading(false);
  };

  const cardStyle: React.CSSProperties = { background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" };
  const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 16px", borderRadius: "14px", border: "2px solid #f1f5f9", fontSize: "15px", fontWeight: "600", outline: "none", backgroundColor: "#f8fafc", color: "#1e293b" };
  const labelStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" };

  if (isOrdered) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backgroundColor: "#f8fafc" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px" }}>
            <CheckCircle size={40} color="#059669" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#1e293b", marginBottom: "10px" }}>สั่งซื้อสำเร็จ!</h1>
          <p style={{ color: "#64748b", fontWeight: 500, marginBottom: "30px" }}>ขอบคุณที่ช้อปกับเรา เรากำลังจัดเตรียมสินค้าให้คุณ</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/orders" style={{ flex: 1, padding: "14px", borderRadius: "14px", fontWeight: "bold", textDecoration: "none", backgroundColor: "white", color: "#64748b", border: "2px solid #f1f5f9", textAlign: "center" }}>ดู Orders</Link>
            <Link href="/" style={{ flex: 1, padding: "14px", borderRadius: "14px", fontWeight: "bold", textDecoration: "none", backgroundColor: "#0f172a", color: "white", textAlign: "center" }}>ช้อปต่อ</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "60px 20px", backgroundColor: "#f8fafc" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <Link href="/cart" style={{ padding: "12px", backgroundColor: "white", border: "2px solid #f1f5f9", borderRadius: "16px", textDecoration: "none", color: "#94a3b8", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#1e293b", margin: 0 }}>Checkout</h1>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>ยืนยันที่อยู่และชำระเงิน</p>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center", gap: "30px" }}>
          {/* ข้อมูลจัดส่ง */}
          <div style={{ ...cardStyle, flex: "1 1 500px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
              <MapPin size={22} color="#f43f5e" />
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b", margin: 0 }}>ข้อมูลการจัดส่ง</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {[
                { icon: User, label: "ชื่อผู้รับ", key: "name", ph: "ระบุชื่อ-นามสกุล..." },
                { icon: Phone, label: "เบอร์โทรศัพท์", key: "phone", ph: "0xx-xxx-xxxx" },
                { icon: MapPin, label: "ที่อยู่จัดส่ง", key: "address", ph: "บ้านเลขที่, ถนน, ตำบล...", multi: true },
              ].map(({ icon: Icon, label, key, ph, multi }) => (
                <div key={key}>
                  <label style={labelStyle}><Icon size={12} /> {label}</label>
                  {multi ? (
                    <textarea value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={4} placeholder={ph} style={inputStyle} />
                  ) : (
                    <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={inputStyle} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* สรุปรายการ */}
          <div style={{ flex: "1 1 350px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b", marginBottom: "20px" }}>สรุปคำสั่งซื้อ</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "350px", overflowY: "auto", paddingRight: "10px" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <img src={item.image || "/placeholder.png"} style={{ width: "60px", height: "60px", borderRadius: "16px", objectFit: "cover", backgroundColor: "#f1f5f9" }} alt="" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>จำนวน {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 900, color: "#1e293b" }}>฿{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "2px solid #f8fafc", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: "bold" }}><span>ยอดรวม</span><span>฿{totalPrice.toLocaleString()}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontWeight: "bold" }}><span>ค่าจัดส่ง</span><span style={{ color: "#059669", fontWeight: 900 }}>ฟรี</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#1e293b", fontWeight: 900, fontSize: "24px", paddingTop: "10px" }}><span>ยอดชำระเงิน</span><span style={{ color: "#4f46e5" }}>฿{totalPrice.toLocaleString()}</span></div>
              </div>
            </div>
            <button onClick={handleConfirm} disabled={loading} style={{ width: "100%", padding: "18px", borderRadius: "18px", fontSize: "18px", fontWeight: 900, color: "white", backgroundColor: "#0f172a", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              {loading ? "กำลังสร้าง Order..." : "ยืนยันสั่งซื้อสินค้า"} <CreditCard size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}