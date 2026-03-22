"use client";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ShoppingBag, Package, X } from "lucide-react";

const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:18 };

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, cartCount, clearCart } = useCart();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ textAlign:"center", maxWidth:320 }}>
          <div style={{ width:80, height:80, borderRadius:24, background:"var(--bg-soft)", border:"1.5px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <ShoppingBag size={36} color="var(--ink-3)" strokeWidth={1.5}/>
          </div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"var(--ink)", marginBottom:8 }}>ตะกร้าว่างเปล่า</h1>
          <p style={{ color:"var(--ink-3)", marginBottom:24, fontSize:14 }}>เพิ่มสินค้าเพื่อเริ่มต้นช้อปปิ้ง</p>
          <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"var(--accent)", color:"#fff", borderRadius:14, fontWeight:700, fontSize:14, textDecoration:"none" }}>
            เลือกสินค้า →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", padding:"32px 24px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:900, color:"var(--ink)" }}>ตะกร้าสินค้า</h1>
            <p style={{ fontSize:13, color:"var(--ink-3)", marginTop:3 }}>{cartCount} รายการ</p>
          </div>
          <button onClick={clearCart} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:10, fontSize:13, fontWeight:700, color:"var(--ink-3)", cursor:"pointer" }}>
            <X size={14}/> ล้างทั้งหมด
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>
          {/* Items list */}
          <div style={{ ...card, overflow:"hidden" }}>
            {cart.map((item, i) => (
              <div key={item.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderBottom: i < cart.length-1 ? "1px solid var(--border-l)" : "none" }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width:60, height:60, borderRadius:12, objectFit:"cover", border:"1.5px solid var(--border)", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:60, height:60, borderRadius:12, background:"var(--bg-soft)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Package size={22} color="var(--ink-3)"/>
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, color:"var(--ink)", fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                  <p style={{ fontSize:13, fontWeight:800, color:"var(--ink)", marginTop:2 }}>฿{item.price.toLocaleString()}</p>
                </div>
                {/* Qty control */}
                <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
                  <button onClick={()=>updateQuantity(item.id,-1)} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--bg-soft)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink)" }}>
                    <Minus size={13}/>
                  </button>
                  <span style={{ fontWeight:800, color:"var(--ink)", width:24, textAlign:"center" }}>{item.quantity}</span>
                  <button onClick={()=>updateQuantity(item.id,1)} style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid var(--border)", background:"var(--bg-soft)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink)" }}>
                    <Plus size={13}/>
                  </button>
                </div>
                <p style={{ fontWeight:800, color:"var(--ink)", fontSize:15, width:72, textAlign:"right", flexShrink:0 }}>฿{(item.price*item.quantity).toLocaleString()}</p>
                <button onClick={()=>removeFromCart(item.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, color:"var(--ink-3)", flexShrink:0 }}>
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ ...card, padding:22, position:"sticky", top:80 }}>
            <h2 style={{ fontWeight:800, color:"var(--ink)", fontSize:16, marginBottom:18, paddingBottom:14, borderBottom:"1.5px solid var(--border)" }}>สรุปคำสั่งซื้อ</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"var(--ink-2)" }}>
                <span>สินค้า ({cartCount} รายการ)</span>
                <span style={{ fontWeight:700 }}>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, color:"var(--ink-2)" }}>
                <span>ค่าจัดส่ง</span>
                <span style={{ fontWeight:700, color:"var(--success)" }}>ฟรี</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:900, color:"var(--ink)", paddingTop:12, borderTop:"1.5px solid var(--border)", marginTop:4 }}>
                <span>รวมทั้งหมด</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <button onClick={()=>router.push("/checkout")} style={{ width:"100%", padding:"14px", background:"var(--ink)", color:"#fff", border:"none", borderRadius:14, fontWeight:800, fontSize:15, cursor:"pointer" }}>
              ดำเนินการสั่งซื้อ →
            </button>
            <Link href="/" style={{ display:"block", textAlign:"center", fontSize:13, color:"var(--ink-3)", marginTop:12, textDecoration:"none" }}>← ช้อปปิ้งต่อ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
