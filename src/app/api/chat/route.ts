import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../auth";
import { sendToUser, sendToAdmins } from "./stream/route";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId"); // admin ใช้ดูแชทของ user คนนั้น

  const userId = session.user.role === "ADMIN" && targetUserId
    ? targetUserId
    : session.user.id;

  const messages = await prisma.message.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });

  // Mark as read
  if (session.user.role === "ADMIN") {
    await prisma.message.updateMany({
      where: { userId, isAdmin: false, read: false },
      data: { read: true },
    });
  } else {
    await prisma.message.updateMany({
      where: { userId, isAdmin: true, read: false },
      data: { read: true },
    });
  }

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, targetUserId } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const isAdmin = session.user.role === "ADMIN";
  const userId  = isAdmin && targetUserId ? targetUserId : session.user.id;

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      isAdmin,
      userId,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  const payload = { type: "message", message };

  if (isAdmin) {
    // Admin ส่ง → notify user คนนั้น
    sendToUser(userId, payload);
    // notify admin ด้วย (เพื่ออัปเดต UI ตัวเอง)
    sendToAdmins(payload);
  } else {
    // User ส่ง → notify admin ทุกคน
    sendToAdmins({ ...payload, fromUserId: session.user.id });
    // notify ตัวเองด้วย
    sendToUser(session.user.id, payload);
  }

  return NextResponse.json(message, { status: 201 });
}
