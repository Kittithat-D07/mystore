import { prisma } from "../../../lib/prisma";
import CategoryActions from "./CategoryActions";
import AddCategoryForm from "./AddCategoryForm";
import { Tag } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const card: React.CSSProperties = { background:"var(--bg-card)", border:"1.5px solid var(--border)", borderRadius:16, overflow:"hidden" };
const th: React.CSSProperties = { padding:"10px 16px", fontSize:10, fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.12em", color:"var(--ink-3)", textAlign:"left" as const };

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ include:{ _count:{ select:{ products:true } } }, orderBy:{ name:"asc" } });
  return (
    <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, background:"var(--accent-l)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Tag size={20} color="var(--accent)"/>
          </div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:"var(--ink)" }}>Categories</h1>
            <p style={{ fontSize:13, color:"var(--ink-3)" }}>{categories.length} categories</p>
          </div>
        </div>
        <AddCategoryForm/>
      </div>

      <div style={card}>
        {categories.length === 0 ? (
          <div style={{ padding:"40px", textAlign:"center", color:"var(--ink-3)", fontWeight:600 }}>No categories yet.</div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"var(--bg-soft)", borderBottom:"1.5px solid var(--border)" }}>
              {["ชื่อหมวดหมู่","สินค้า","ACTIONS"].map(h=><th key={h} style={th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {categories.map(cat=>(
                <tr key={cat.id} style={{ borderBottom:"1px solid var(--border-l)" }}>
                  <td style={{ padding:"13px 16px", fontWeight:700, color:"var(--ink)", fontSize:14 }}>{cat.name}</td>
                  <td style={{ padding:"13px 16px" }}>
                    <span style={{ fontSize:12, fontWeight:600, padding:"3px 12px", borderRadius:20, background:"var(--bg-soft)", color:"var(--ink-2)" }}>{cat._count.products} สินค้า</span>
                  </td>
                  <td style={{ padding:"13px 16px", textAlign:"right" }}>
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end", alignItems:"center" }}>
                      <Link href={`/admin/categories/${cat.id}`} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", background:"var(--accent-l)", color:"var(--accent)", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none", border:"1.5px solid var(--border-l)" }}>
                        ดูสินค้า <ChevronRight size={13}/>
                      </Link>
                      <CategoryActions categoryId={cat.id} categoryName={cat.name} productCount={cat._count.products}/>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
