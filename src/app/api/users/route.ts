import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      } : {},
      select: {
        id: true, email: true, name: true, role: true,
        isActive: true, emailVerified: true,
        loginAttempts: true, lockUntil: true,
        createdAt: true, _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
