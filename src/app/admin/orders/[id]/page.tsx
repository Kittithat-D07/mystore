import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, Phone } from "lucide-react";
import ChangeStatusButton from "../ChangeStatusButton";

const statusBadge: Record<string, { bg:string; color:string }> = {
  PENDING:   { bg:"#FEF3C7", color:"#92400E" },
  PAID:      { bg:"#DBEAFE", color:"#1E40AF" },
  SHIPPED:   { bg:"#EDE9FE", color:"#5B21B6" },
  DELIVERED: { bg:"#D1FAE5", color:"#065F46" },
  CANCELLED: { bg:"#FEE2E2", color:"#991B1B" },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id:string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select:{ name:true, email:true, createdAt:true } },
      items: { include:{ product:{ select:{ name:true, images:true, sku:true } } } },
    },
  });
  if (!order) notFound();

  const sb = statusBadge[order.status] || { bg:"var(--bg-soft)", color:"var(--ink-2)" };
  const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:16 };

  const timeline = ["PENDING","PAID","SHIPPED","DELIVERED"];
  const doneMap: Record<string,string[]> = {
    PENDING:["PENDING"], PAID:["PENDING","PAID"], SHIPPED:["PENDING","PAID","SHIPPED"],
    DELIVERED:["PENDING","PAID","SHIPPED","DELIVERED"], CANCELLED:[],
  };
  const doneLabels: Record<string,string> = { PENDING:"รอดำเนินการ", PAID:"ชำระแล้ว", SHIPPED:"จัดส่งแล้ว", DELIVERED:"ส่งถึงแล้ว" };
  const done = new Set(doneMap[order.status]||[]);

  return (
    <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <Link href="/admin/orders" style={{ padding:8, background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:10, display:"flex", color:"var(--ink-3)", textDecoration:"none" }}>
          <ArrowLeft size={17}/>
        </Link>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:19, fontWeight:900, color:"var(--ink)" }}>Order Detail</h1>
          <p style={{ fontSize:11, fontFamily:"monospace", color:"var(--ink-3)" }}>#{order.id.toUpperCase()}</p>
        </div>
        <span style={{ fontSize:11, fontWeight:700, padding:"5px 13px", borderRadius:20, background:sb.bg, color:sb.color }}>{order.status}</span>
        <ChangeStatusButton orderId={order.id} currentStatus={order.status}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:18, alignItems:"start" }}>
        {/* LEFT */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Items */}
          <div style={{ ...card, overflow:"hidden" }}>
            <div style={{ padding:"13px 18px", borderBottom:"1.5px solid var(--border)", display:"flex", alignItems:"center", gap:7 }}>
              <Package size={15} color="var(--ink-3)"/>
              <span style={{ fontWeight:800, color:"var(--ink)", fontSize:14 }}>รายการสินค้า ({order.items.length})</span>
            </div>
            {order.items.map((item,i)=>(
              <div key={item.id} style={{ padding:"13px 18px", display:"flex", alignItems:"center", gap:12, borderBottom: i<order.items.length-1?"1px solid var(--border-l)":"none" }}>
                {item.product.images[0] ? (
                  <img src={item.product.images[0]} style={{ width:48,height:48,borderRadius:10,objectFit:"cover",border:"1.5px solid var(--border)",flexShrink:0 }} alt=""/>
                ) : (
                  <div style={{ width:48,height:48,borderRadius:10,background:"var(--bg-soft)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:10,color:"var(--ink-3)" }}>IMG</div>
                )}
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontWeight:700,color:"var(--ink)",fontSize:13 }}>{item.product.name}</p>
                  <p style={{ fontSize:11,fontFamily:"monospace",color:"var(--ink-3)" }}>{item.product.sku}</p>
                  <p style={{ fontSize:12,color:"var(--ink-3)",marginTop:1 }}>x{item.quantity} · ฿{item.price.toLocaleString()} / ชิ้น</p>
                </div>
                <p style={{ fontWeight:800,color:"var(--ink)",fontSize:14,flexShrink:0 }}>฿{(item.price*item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div style={{ padding:"12px 18px",background:"var(--bg-soft)",borderTop:"1.5px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontWeight:600,color:"var(--ink-2)",fontSize:13 }}>ยอดชำระทั้งหมด</span>
              <span style={{ fontWeight:900,color:"var(--accent)",fontSize:18 }}>฿{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Timeline */}
          {order.status!=="CANCELLED" ? (
            <div style={{ ...card,padding:"16px 18px" }}>
              <p style={{ fontWeight:800,color:"var(--ink)",fontSize:14,marginBottom:18 }}>สถานะการจัดส่ง</p>
              <div style={{ display:"flex" }}>
                {timeline.map((st,i)=>{
                  const isDone=done.has(st);
                  const isLast=i===timeline.length-1;
                  return (
                    <div key={st} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",position:"relative" }}>
                      {!isLast && <div style={{ position:"absolute",top:13,left:"50%",width:"100%",height:2,background:isDone&&done.has(timeline[i+1])?"var(--accent)":"var(--border)",zIndex:0 }}/>}
                      <div style={{ position:"relative",zIndex:1,width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,background:isDone?"var(--accent)":"var(--bg-card)",color:isDone?"#fff":"var(--ink-3)",border:`2px solid ${isDone?"var(--accent)":"var(--border)"}` }}>
                        {isDone?"✓":i+1}
                      </div>
                      <p style={{ fontSize:11,fontWeight:700,color:isDone?"var(--accent)":"var(--ink-3)",marginTop:5,textAlign:"center" }}>{doneLabels[st]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ background:"#FEE2E2",border:"1.5px solid #FECACA",borderRadius:14,padding:"14px 18px",display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:28,height:28,borderRadius:"50%",background:"#FEE2E2",border:"1.5px solid #FECACA",display:"flex",alignItems:"center",justifyContent:"center",color:"#DC2626",fontWeight:900,flexShrink:0 }}>✕</div>
              <div>
                <p style={{ fontWeight:800,color:"#991B1B",fontSize:13 }}>Order ถูกยกเลิก</p>
                <p style={{ fontSize:12,color:"#DC2626" }}>Order นี้ถูกยกเลิกแล้ว</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Shipping */}
          <div style={{ ...card, padding:18 }}>
            <p style={{ fontWeight:800,color:"var(--ink)",fontSize:14,marginBottom:14,display:"flex",alignItems:"center",gap:7 }}>
              <MapPin size={14} color="var(--accent)"/> ที่อยู่จัดส่ง
            </p>
            {order.shippingName||order.shippingPhone||order.shippingAddress ? (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {order.shippingName && (
                  <div>
                    <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)",display:"flex",alignItems:"center",gap:5 }}>
                      <User size={11} color="var(--ink-3)"/> ชื่อผู้รับ
                    </p>
                    <p style={{ fontWeight:700,color:"var(--ink)",fontSize:13,marginTop:3 }}>{order.shippingName}</p>
                  </div>
                )}
                {order.shippingPhone && (
                  <div>
                    <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)",display:"flex",alignItems:"center",gap:5 }}>
                      <Phone size={11} color="var(--ink-3)"/> เบอร์โทร
                    </p>
                    <p style={{ fontWeight:700,color:"var(--ink)",fontSize:13,marginTop:3 }}>{order.shippingPhone}</p>
                  </div>
                )}
                {order.shippingAddress && (
                  <div>
                    <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)",display:"flex",alignItems:"center",gap:5 }}>
                      <MapPin size={11} color="var(--ink-3)"/> ที่อยู่
                    </p>
                    <p style={{ fontWeight:600,color:"var(--ink)",fontSize:13,marginTop:3,lineHeight:1.6,wordBreak:"break-word" as const }}>{order.shippingAddress}</p>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize:12,color:"var(--ink-3)",textAlign:"center",padding:"10px 0" }}>ไม่มีข้อมูลที่อยู่จัดส่ง</p>
            )}
          </div>

          {/* Customer */}
          <div style={{ ...card, padding:18 }}>
            <p style={{ fontWeight:800,color:"var(--ink)",fontSize:14,marginBottom:14,display:"flex",alignItems:"center",gap:7 }}>
              <User size={14} color="var(--accent)"/> ข้อมูลลูกค้า
            </p>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[{l:"ชื่อ",v:order.user.name||"—"},{l:"อีเมล",v:order.user.email},{l:"สมัครเมื่อ",v:new Date(order.user.createdAt).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"})}].map(({l,v})=>(
                <div key={l}>
                  <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)" }}>{l}</p>
                  <p style={{ fontWeight:700,color:"var(--ink)",fontSize:13,marginTop:2,wordBreak:"break-all" as const }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div style={{ ...card, padding:18 }}>
            <div style={{ marginBottom:10 }}>
              <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)" }}>วันที่สั่ง</p>
              <p style={{ fontWeight:700,color:"var(--ink)",fontSize:13,marginTop:2 }}>
                {new Date(order.createdAt).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit"})}
              </p>
            </div>
            <div>
              <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase" as const,letterSpacing:"0.1em",color:"var(--ink-3)" }}>ยอดชำระ</p>
              <p style={{ fontWeight:900,color:"var(--accent)",fontSize:22,marginTop:4 }}>฿{order.totalAmount.toLocaleString()}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
