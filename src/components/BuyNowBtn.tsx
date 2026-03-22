"use client";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export default function BuyNowBtn({ product }: { product: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    addToCart(product); // ใส่ตะกร้า
    router.push("/checkout"); // ส่งไปหน้าจ่ายเงินทันที
  };

  return (
    <button
      onClick={handleBuyNow}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "18px 24px",
        backgroundColor: "#0f172a", // สีดำเข้มให้ดูเด่น
        color: "#fff",
        borderRadius: "16px",
        border: "none",
        fontSize: "16px",
        fontWeight: "900",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1e293b")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f172a")}
    >
      <Zap size={18} fill="currentColor" /> ซื้อเลย
    </button>
  );
}