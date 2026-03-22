import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/apiAuth";
import { productSchema, zodError } from "../../../lib/schemas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId");
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (e) {
    console.error("GET /api/products error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(zodError(parsed.error), { status: 400 });
    }

    const { name, sku, description, price, stock, images, categoryId } = parsed.data;
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description: description || "",
        price,
        stock,
        images: images || [],
        categoryId: categoryId || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/products error:", e);
    if (e.code === "P2002") return NextResponse.json({ error: "SKU ซ้ำ กรุณาเปลี่ยนใหม่" }, { status: 400 });
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 });
  }
}
