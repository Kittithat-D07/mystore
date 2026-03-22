import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import AddToCartBtnLarge from "../../../../components/AddToCartBtnLarge";
import BuyNowBtn from "../../../../components/BuyNowBtn"; 
import ImageGallery from "../../../../components/ImageGallery";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60; // revalidate ทุก 60 วินาที

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true, description: true } });
  if (!product) return { title: "ไม่พบสินค้า" };
  return {
    title: `${product.name} | MyStore`,
    description: product.description || undefined,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) notFound();

  const badgeStyle: React.CSSProperties = { display: "inline-block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", padding: "4px 14px", borderRadius: 20, background: "#f1f5f9", color: "#64748b", marginBottom: 12 };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <Link href="/" style={{ padding: "10px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#64748b", display: "flex" }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
            <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>ร้านค้า</Link>
            <span>/</span>
            {product.category && <><span style={{ color: "#0f172a" }}>{product.category.name}</span><span>/</span></>}
            <span style={{ color: "#0f172a" }}>{product.name}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60, alignItems: "start" }}>
          <div style={{ position: "sticky", top: 40 }}>
            <ImageGallery images={product.images} name={product.name} />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {product.category && <span style={badgeStyle}>{product.category.name}</span>}
            <h1 style={{ fontSize: "42px", fontWeight: 900, color: "#0f172a", lineHeight: 1.1, marginBottom: 16 }}>{product.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, paddingBottom: 24, borderBottom: "2px solid #f1f5f9" }}>
              <p style={{ fontSize: 36, fontWeight: 900, color: "#0f172a" }}>฿{product.price.toLocaleString()}</p>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", background: "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>SKU: {product.sku}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: product.stock > 0 ? "#10b981" : "#ef4444" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: product.stock > 0 ? "#10b981" : "#ef4444" }}>มีสินค้า {product.stock} ชิ้น</span>
            </div>

            {product.description && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 20, padding: 24, marginBottom: 32 }}>
                <p style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>รายละเอียดสินค้า</p>
                <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15, whiteSpace: "pre-line" }}>{product.description}</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 40 }}>
              <AddToCartBtnLarge product={product} />
              <BuyNowBtn product={product} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <Truck size={20} color="#3b82f6" /> <span style={{ fontSize: 13, fontWeight: 700 }}>จัดส่งฟรี</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <ShieldCheck size={20} color="#10b981" /> <span style={{ fontSize: 13, fontWeight: 700 }}>ของแท้ 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}