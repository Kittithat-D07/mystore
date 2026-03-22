import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/apiAuth";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // ดึง user ที่มีแชทพร้อมข้อความล่าสุดและจำนวนที่ยังไม่ได้อ่าน
  const usersWithMessages = await prisma.user.findMany({
    where: {
      messages: { some: {} },
      role: "USER",
    },
    select: {
      id: true,
      name: true,
      email: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, isAdmin: true, read: true },
      },
      _count: {
        select: {
          messages: { where: { isAdmin: false, read: false } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(usersWithMessages);
}
