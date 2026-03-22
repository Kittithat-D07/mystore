import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/apiAuth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const { id } = await params;
    const body = await req.json();
    const data: any = {};
    for (const key of ["role", "isActive"]) { if (key in body) data[key] = body[key]; }
    if (body.unlock) { data.loginAttempts = 0; data.lockUntil = null; }
    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
