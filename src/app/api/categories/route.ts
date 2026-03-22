import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { requireAdmin } from "../../../lib/apiAuth";
import { categorySchema, zodError } from "../../../lib/schemas";

export async function GET() {
  try {
    const cats = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } });
    return NextResponse.json(cats);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
    const cat = await prisma.category.create({ data: { name: parsed.data.name } });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "ชื่อ Category ซ้ำ" }, { status: 400 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
