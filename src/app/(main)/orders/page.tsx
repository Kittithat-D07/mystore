import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Package, Calendar, Hash } from "lucide-react";
import CancelOrderButton from "./CancelOrderButton";

const statusStyle: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  PAID:      { bg: "#DBEAFE", color: "#1E40AF" },
  SHIPPED:   { bg: "#EDE9FE", color: "#5B21B6" },
  DELIVERED: { bg: "#D1FAE5", color: "#065F46" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B" },
};
const statusLabel: Record<string, string> = { 
  PENDING: "รอดำเนินการ", 
  PAID: "ชำระแล้ว", 
  SHIPPED: "กำลังจัดส่ง", 
  DELIVERED: "ส่งแล้ว", 
  CANCELLED: "ยกเลิกแล้ว" 
};

export default async function MyOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { name: true, images: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  // --- Inline Styles (บังคับสวย) ---
  const containerStyle: React.CSSProperties = { minHeight: "100vh", padding: "40px 20px", backgroundColor: "#f8fafc" };
  const cardStyle: React.CSSProperties = { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "24px", marginBottom: "24px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" };
  const headerStyle: React.CSSProperties = { padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc" };
  const itemRowStyle: React.CSSProperties = { padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px", borderBottom: "1px solid #f1f5f9" };
  const footerStyle: React.CSSProperties = { padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Page Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px" }}>
          <Link href="/" style={{ padding: "12px", backgroundColor: "white", border: "2px solid #f1f5f9", borderRadius: "16px", textDecoration: "none", color: "#94a3b8", display: "flex" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, color: "#1e293b", margin: 0 }}>คำสั่งซื้อของฉัน</h1>
            <p style={{ fontSize: "14px", color: "#64748b", fontWeight: "bold" }}>{orders.length} รายการทั้งหมด</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div style={{ ...cardStyle, padding: "80px", textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "24px", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <ShoppingBag size={40} color="#94a3b8" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#1e293b" }}>ยังไม่มีคำสั่งซื้อ</h2>
            <Link href="/" style={{ marginTop: "20px", display: "inline-block", padding: "12px 30px", backgroundColor: "#0f172a", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: "bold" }}>ไปช้อปปิ้งเลย</Link>
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const st = statusStyle[order.status] || { bg: "#f1f5f9", color: "#64748b" };
              return (
                <div key={order.id} style={cardStyle}>
                  {/* Order Header */}
                  <div style={headerStyle}>
                    <div style={{ display: "flex", flexFlow: "column", gap: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94a3b8", fontSize: "12px", fontWeight: "bold" }}>
                        <Hash size={14} /> {order.id.slice(0, 12).toUpperCase()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                        <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 900, padding: "6px 14px", borderRadius: "50px", backgroundColor: st.bg, color: st.color }}>
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div style={{ backgroundColor: "#fff" }}>
                    {order.items.map((item) => (
                      <div key={item.id} style={itemRowStyle}>
                        <img 
                          src={item.product.images[0] || "/placeholder.png"} 
                          style={{ width: "56px", height: "56px", borderRadius: "14px", objectFit: "cover", border: "1px solid #f1f5f9" }} 
                          alt="" 
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "15px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{item.product.name}</p>
                          <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                            {item.quantity} ชิ้น  ·  ฿{item.price.toLocaleString()} / ชิ้น
                          </p>
                        </div>
                        <p style={{ fontSize: "16px", fontWeight: 900, color: "#1e293b" }}>฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div style={footerStyle}>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#94a3b8" }}>
                      ทั้งหมด {order.items.length} รายการ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      {order.status === "PENDING" && <CancelOrderButton orderId={order.id} />}
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", margin: 0 }}>ราคาสุทธิ</p>
                        <p style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>฿{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}