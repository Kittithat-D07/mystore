import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Package } from "lucide-react";
import RemoveFromCategoryButton from "./RemoveFromCategoryButton";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{category.name}</h1>
            <p className="text-slate-500 text-sm">{category.products.length} สินค้าในหมวดหมู่นี้</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-900 flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            สินค้าทั้งหมด
          </h2>
          <Link
            href={`/admin?q=`}
            className="text-xs text-teal-600 font-bold hover:underline"
          >
            จัดการสินค้าทั้งหมด →
          </Link>
        </div>

        {category.products.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-slate-500">ยังไม่มีสินค้าในหมวดหมู่นี้</p>
            <p className="text-slate-400 text-sm mt-1">ไปเพิ่มสินค้าแล้วเลือก category นี้ได้เลย</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 mt-4 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-sm hover:bg-teal-600 transition-all"
            >
              ไปหน้าสินค้า
            </Link>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">สินค้า</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">ราคา</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">สต็อก</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">สถานะ</th>
                <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {category.products.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-300 text-xs">
                          IMG
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">
                    ฿{product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                      product.stock === 0
                        ? "bg-red-100 text-red-600"
                        : product.stock <= 5
                        ? "bg-amber-100 text-amber-600"
                        : "bg-green-100 text-green-600"
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {product.isActive ? "เปิดขาย" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RemoveFromCategoryButton productId={product.id} productName={product.name} />
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
