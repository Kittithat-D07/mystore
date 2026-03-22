import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import bcrypt from "bcryptjs";
import { profileNameSchema, profilePasswordSchema, zodError } from "../../../lib/schemas";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if ("name" in body) {
      const parsed = profileNameSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
      await prisma.user.update({ where: { id: session.user.id }, data: { name: parsed.data.name.trim() } });
      return NextResponse.json({ message: "อัปเดตชื่อสำเร็จ" });
    }
    if ("currentPassword" in body) {
      const parsed = profilePasswordSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
      const match = await bcrypt.compare(parsed.data.currentPassword, user.password);
      if (!match) return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
      const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
      await prisma.user.update({ where: { id: session.user.id }, data: { password: hashed } });
      return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
