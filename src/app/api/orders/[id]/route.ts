import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin, requireAuth } from "../../../../lib/apiAuth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAuth();
  if (error) return error;
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, createdAt: true } }, items: { include: { product: { select: { name: true, images: true, sku: true } } } } },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const { status } = await req.json();
    const validStatuses = ["PENDING","PAID","SHIPPED","DELIVERED","CANCELLED"];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: "Status ไม่ถูกต้อง" }, { status: 400 });
    const order = await prisma.order.update({ where: { id }, data: { status } });
    return NextResponse.json(order);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    await prisma.order.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAuth();
  if (error) return error;
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, select: { userId: true, status: true } });
    if (!order) return NextResponse.json({ error: "ไม่พบ order" }, { status: 404 });
    if (order.userId !== session!.user!.id) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
    if (!["PENDING"].includes(order.status)) return NextResponse.json({ error: "ไม่สามารถยกเลิก order ที่ดำเนินการแล้วได้" }, { status: 400 });
    const updated = await prisma.order.update({ where: { id }, data: { status: "CANCELLED" } });
    return NextResponse.json(updated);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
