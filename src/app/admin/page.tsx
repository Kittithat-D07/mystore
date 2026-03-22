import { prisma } from "../../lib/prisma";
import Link from "next/link";
import SalesChart from "./SalesChart";
import SearchInput from "./SearchInput";
import AddProductModal from "../../components/AddProductModal";
import EditProductModal from "../../components/EditProductModal";
import DeleteButton from "./DeleteButton";
import ToggleActiveButton from "./ToggleActiveButton";
import { ShoppingBag, Users, Package, TrendingUp, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic"; // admin ต้องการข้อมูล real-time

// --- 1. Styles & Constants ---
const styles = {
  container: { padding: "28px 32px", display: "flex" as const, flexDirection: "column" as const, gap: 24 },
  card: { background: "var(--bg-card)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "20px 24px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" as const },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 },
  tableHeader: { padding: "10px 16px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--ink-3)", textAlign: "left" as const },
  statusBadge: (status: string) => {
    const config: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: "#FEF3C7", color: "#92400E" },
      PAID: { bg: "#DBEAFE", color: "#1E40AF" },
      SHIPPED: { bg: "#EDE9FE", color: "#5B21B6" },
      DELIVERED: { bg: "#D1FAE5", color: "#065F46" },
      CANCELLED: { bg: "#FEE2E2", color: "#991B1B" },
    };
    return config[status] || { bg: "var(--bg-soft)", color: "var(--ink-2)" };
  }
};

// --- 2. Helper Functions ---
async function getChartData() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const labels = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return Promise.all(days.map(async (start) => {
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end }, status: { not: "CANCELLED" } },
      select: { totalAmount: true }
    });
    return {
      day: labels[start.getDay()],
      revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      orders: orders.length
    };
  }));
}

// --- 3. Main Component ---
export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q || "";

  // Data Fetching
  const [productCount, orderCount, userCount, revenue, recentOrders, products, chartData] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
    prisma.product.findMany({
      where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { sku: { contains: query, mode: "insensitive" } }] } : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getChartData(),
  ]);

  const stats = [
    { label: "รายได้รวม", value: `฿${(revenue._sum.totalAmount || 0).toLocaleString()}`, icon: TrendingUp, color: "var(--accent)", bg: "var(--accent-l)" },
    { label: "Orders", value: orderCount, icon: ShoppingBag, color: "#2563EB", bg: "#DBEAFE" },
    { label: "สินค้า", value: productCount, icon: Package, color: "#7C3AED", bg: "#EDE9FE" },
    { label: "ผู้ใช้งาน", value: userCount, icon: Users, color: "#D97706", bg: "#FEF3C7" },
  ];

  return (
    <div style={styles.container}>
      
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.5px" }}>
            {query ? `Results for "${query}"` : "Dashboard"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>Welcome back, Admin</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SearchInput defaultValue={query} />
          <AddProductModal />
        </div>
      </header>

      {/* --- STATS CARDS --- */}
      <section style={styles.statsGrid}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...styles.card, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 24, fontWeight: 900, color: "var(--ink)", lineHeight: 1.1 }}>{value}</p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* --- CHART & RECENT ORDERS --- */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <SalesChart data={chartData} />
        
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontWeight: 800, color: "var(--ink)", fontSize: 15 }}>Orders ล่าสุด</h3>
            <Link href="/admin/orders" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
              ดูทั้งหมด <ArrowRight size={12} />
            </Link>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentOrders.length === 0 ? (
              <p style={{ color: "var(--ink-3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>ยังไม่มี order</p>
            ) : recentOrders.map(order => {
              const s = styles.statusBadge(order.status);
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: 10, textDecoration: "none" }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{order.user.name || order.user.email}</p>
                    <p style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace" }}>{order.id.slice(0, 8)}...</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)" }}>฿{order.totalAmount.toLocaleString()}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.color }}>{order.status}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- PRODUCTS TABLE --- */}
      <section style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1.5px solid var(--border)" }}>
          <h3 style={{ fontWeight: 800, color: "var(--ink)", fontSize: 15 }}>สินค้า ({productCount})</h3>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-soft)", borderBottom: "1.5px solid var(--border)" }}>
              {["สินค้า", "Category", "ราคา", "สต็อก", "สถานะ", "Actions"].map(h => (
                <th key={h} style={styles.tableHeader}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border-l)" }}>
                {/* Product Info */}
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {p.images[0] 
                      ? <img src={p.images[0]} style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", border: "1.5px solid var(--border)", flexShrink: 0 }} alt="" /> 
                      : <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--bg-soft)", flexShrink: 0 }} />
                    }
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--ink)", fontSize: 13 }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "monospace" }}>{p.sku}</p>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "var(--bg-soft)", color: "var(--ink-2)" }}>
                    {p.category?.name || "—"}
                  </span>
                </td>
                {/* Price */}
                <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--ink)", fontSize: 14 }}>฿{p.price.toLocaleString()}</td>
                {/* Stock */}
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ 
                    fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, 
                    background: p.stock === 0 ? "#FEE2E2" : p.stock <= 5 ? "#FEF3C7" : "#D1FAE5", 
                    color: p.stock === 0 ? "#991B1B" : p.stock <= 5 ? "#92400E" : "#065F46" 
                  }}>
                    {p.stock} units
                  </span>
                </td>
                {/* Status Toggle */}
                <td style={{ padding: "12px 16px" }}>
                  <ToggleActiveButton id={p.id} isActive={p.isActive} />
                </td>
                {/* Actions */}
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <EditProductModal product={p} />
                    <DeleteButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600 }}>ไม่พบสินค้า</div>
        )}
      </section>
    </div>
  );
}