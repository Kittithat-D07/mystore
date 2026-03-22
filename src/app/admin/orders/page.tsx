import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import OrderStatusButton from "./OrderStatusButton";
import { ShoppingBag, Eye } from "lucide-react";

const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:16, overflow:"hidden" };
const th: React.CSSProperties = { padding:"10px 16px", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.12em", color:"var(--ink-3)", textAlign:"left" as const };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?:string }> }) {
  const { status } = await searchParams;
  const filter = status && status!=="ALL" ? { status:status as any } : {};
  const [orders, totalCount, counts] = await Promise.all([
    prisma.order.findMany({ where:filter, include:{ user:{select:{name:true,email:true}}, items:{include:{product:{select:{name:true,images:true}}}} }, orderBy:{ createdAt:"desc" }, take:50 }),
    prisma.order.count(),
    prisma.order.groupBy({ by:["status"], _count:true }),
  ]);
  const countMap: Record<string,number> = {};
  counts.forEach(c=>countMap[c.status]=c._count);

  return (
    <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:40, height:40, background:"var(--accent-l)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ShoppingBag size={20} color="var(--accent)"/>
        </div>
        <div>
          <h1 style={{ fontSize:22, fontWeight:900, color:"var(--ink)" }}>Orders</h1>
          <p style={{ fontSize:13, color:"var(--ink-3)" }}>{totalCount} orders ทั้งหมด</p>
        </div>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {["ALL","PENDING","PAID","SHIPPED","DELIVERED","CANCELLED"].map(tab => {
          const active = (status||"ALL") === tab;
          const count = tab==="ALL" ? totalCount : (countMap[tab]||0);
          return (
            <a key={tab} href={`/admin/orders?status=${tab}`} style={{ padding:"7px 16px", borderRadius:20, fontSize:12, fontWeight:700, textDecoration:"none", border:"1.5px solid", background:active?"var(--accent)":"var(--bg-card)", color:active?"#fff":"var(--ink-2)", borderColor:active?"var(--accent)":"var(--border)" }}>
              {tab} {count>0 && <span style={{ opacity:0.65 }}>{count}</span>}
            </a>
          );
        })}
      </div>

      <div style={card}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"var(--bg-soft)", borderBottom:"1.5px solid var(--border)" }}>
              {["ORDER ID","ลูกค้า","สินค้า","ยอดรวม","วันที่","สถานะ","ACTIONS"].map(h=><th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom:"1px solid var(--border-l)" }}>
                <td style={{ padding:"12px 16px" }}><p style={{ fontFamily:"monospace", fontSize:12, color:"var(--ink-3)" }}>{order.id.slice(0,12)}...</p></td>
                <td style={{ padding:"12px 16px" }}>
                  <p style={{ fontWeight:700, color:"var(--ink)", fontSize:13 }}>{order.user.name||"—"}</p>
                  <p style={{ fontSize:11, color:"var(--ink-3)" }}>{order.user.email}</p>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div style={{ display:"flex", marginLeft:-4 }}>
                    {order.items.slice(0,3).map(item=>(
                      <div key={item.id} style={{ width:30, height:30, borderRadius:8, border:"2px solid var(--bg-card)", background:"var(--bg-soft)", overflow:"hidden", marginLeft:4, flexShrink:0 }}>
                        {item.product.images[0] && <img src={item.product.images[0]} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize:11, color:"var(--ink-3)", marginTop:3 }}>{order.items.length} รายการ</p>
                </td>
                <td style={{ padding:"12px 16px", fontWeight:800, color:"var(--ink)", fontSize:14 }}>฿{order.totalAmount.toLocaleString()}</td>
                <td style={{ padding:"12px 16px", fontSize:12, color:"var(--ink-3)" }}>
                  {new Date(order.createdAt).toLocaleDateString("th-TH",{ day:"numeric", month:"short", year:"numeric" })}
                </td>
                <td style={{ padding:"12px 16px" }}><OrderStatusButton orderId={order.id} currentStatus={order.status}/></td>
                <td style={{ padding:"12px 16px", textAlign:"right" }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", background:"var(--bg-soft)", color:"var(--ink-2)", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none", border:"1.5px solid var(--border)" }}>
                    <Eye size={13}/>ดูรายละเอียด
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length===0 && <div style={{ padding:"40px", textAlign:"center", color:"var(--ink-3)", fontWeight:600 }}>ไม่มี order</div>}
      </div>
    </div>
  );
}
