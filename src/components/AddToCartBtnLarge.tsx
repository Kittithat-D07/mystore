"use client";
import { useCart } from "../context/CartContext";
import { useToast } from "./Toast";
import { ShoppingCart } from "lucide-react";

export default function AddToCartBtnLarge({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  return (
    <button
      onClick={() => { addToCart(product); toast(`เพิ่ม "${product.name}" ในตะกร้าแล้ว`); }}
      style={{
        width:"100%", padding:"16px 24px",
        background:"var(--ink)", color:"#fff",
        border:"none", borderRadius:14,
        fontWeight:800, fontSize:17,
        cursor:"pointer", display:"flex",
        alignItems:"center", justifyContent:"center",
        gap:10, transition:"opacity 0.15s, transform 0.1s",
      }}
      onMouseEnter={e=>(e.currentTarget.style.opacity="0.88")}
      onMouseLeave={e=>(e.currentTarget.style.opacity="1")}
      onMouseDown={e=>(e.currentTarget.style.transform="scale(0.98)")}
      onMouseUp={e=>(e.currentTarget.style.transform="")}
    >
      <ShoppingCart size={22}/>
      Add to Cart
    </button>
  );
}
