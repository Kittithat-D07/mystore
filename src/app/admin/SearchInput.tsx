"use client";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

export default function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(window.location.search);
    if (term) params.set("q", term);
    else params.delete("q");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div style={{ 
      position: "relative", 
      display: "inline-flex", 
      alignItems: "center",
      width: "fit-content"
    }}>
      {/* 🔍 ไอคอนแว่นขยาย - บังคับลอยทับด้วย Z-Index สูงๆ */}
      <div style={{ 
        position: "absolute", 
        left: "14px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        zIndex: 50, /* 🚩 บังคับลอยเหนือทุกอย่าง */
        pointerEvents: "none" /* 🚩 กันไอคอนแย่งการคลิกจาก Input */
      }}>
        <Search size={18} color="#94a3b8" strokeWidth={3} />
      </div>

      <input
        type="text"
        defaultValue={defaultValue}
        placeholder="Search product..."
        onChange={(e) => handleSearch(e.target.value)}
        /* 🚩 🚩 🚩 ถ้าใส่ 50px แล้วยังทับ ผมจะงงมากพี่! 🚩 🚩 🚩 */
        style={{ 
          paddingLeft: "50px", 
          paddingRight: "16px", 
          paddingTop: "12px", 
          paddingBottom: "12px",
          width: "320px",
          borderRadius: "16px",
          border: "2px solid #0d9488", /* สีเขียว Teal */
          backgroundColor: "#ffffff",
          fontSize: "14px",
          fontWeight: "bold",
          color: "#1e293b",
          outline: "none",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          transition: "all 0.2s"
        }}
      />

      {isPending && (
        <div style={{ position: "absolute", right: "12px", zIndex: 50 }}>
           <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}