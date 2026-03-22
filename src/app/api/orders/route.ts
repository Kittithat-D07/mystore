import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { orderSchema, zodError } from "../../../lib/schemas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where = status && status !== "ALL" ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true, images: true } } } } },
        orderBy: { createdAt: "desc" }, take: 50,
      }),
      prisma.order.count({ where }),
    ]);
    return NextResponse.json({ orders, total });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { items, totalAmount, shippingName, shippingPhone, shippingAddress } = parsed.data;

    // ✅ ใช้ transaction ป้องกัน race condition
    const order = await prisma.$transaction(async (tx) => {
      // เช็ค stock แบบ atomic ภายใน transaction
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.id) } },
        select: { id: true, name: true, stock: true, isActive: true },
      });

      for (const item of items) {
        const product = products.find((p) => p.id === item.id);
        if (!product) throw new Error(`ไม่พบสินค้า`);
        if (!product.isActive) throw new Error(`สินค้า "${product.name}" ถูกปิดการขายแล้ว`);
        if (product.stock < item.quantity) throw new Error(`สินค้า "${product.name}" มีสต็อกไม่พอ (เหลือ ${product.stock} ชิ้น)`);
      }

      // ลด stock ทุกตัวก่อน (atomic)
      await Promise.all(
        items.map((item) =>
          tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      // สร้าง order
      return tx.order.create({
        data: {
          totalAmount, userId: session.user.id,
          shippingName, shippingPhone, shippingAddress,
          items: { create: items.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.price })) },
        },
        include: { items: true },
      });
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    console.error("Order Error:", e);
    const msg = e?.message || "สร้าง order ไม่สำเร็จ";
    const isUserError = msg.includes("สินค้า") || msg.includes("ไม่พบ");
    return NextResponse.json({ error: msg }, { status: isUserError ? 400 : 500 });
  }
}
