import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/apiAuth";
import { productSchema, zodError } from "../../../../lib/schemas";
import { unlink } from "fs/promises";
import path from "path";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
    const { name, sku, description, price, stock, images, categoryId } = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: { name, sku, description, price, stock, images: images || [], categoryId: categoryId || null },
    });
    return NextResponse.json(product);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await req.json();

    // ✅ นำสินค้าออกจาก category เท่านั้น
    if (body.removeCategoryOnly) {
      const product = await prisma.product.update({
        where: { id },
        data: { categoryId: null },
      });
      return NextResponse.json(product);
    }

    // toggle isActive
    if ("isActive" in body) {
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: body.isActive },
      });
      return NextResponse.json(product);
    }

    return NextResponse.json({ error: "Invalid PATCH body" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, select: { images: true } });
    if (product?.images) {
      await Promise.allSettled(
        product.images.map(async (imgUrl) => {
          if (imgUrl.startsWith("/uploads/")) {
            try { await unlink(path.join(process.cwd(), "public", imgUrl)); } catch {}
          }
        })
      );
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
