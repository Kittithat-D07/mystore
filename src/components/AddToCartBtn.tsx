"use client";
import { useCart } from "../context/CartContext";

export default function AddToCartBtn({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={(e) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        addToCart(product);
        // alert(`Added ${product.name} to cart! 🛒`); // เปิดไว้ถ้าอยากให้มี Alert
      }}
      className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md py-4 rounded-2xl font-black text-slate-900 translate-y-20 group-hover:translate-y-0 transition-all duration-500 shadow-xl hover:bg-teal-600 hover:text-white z-20"
    >
      + Add to Cart
    </button>
  );
}