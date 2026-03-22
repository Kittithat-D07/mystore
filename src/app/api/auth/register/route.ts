import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { registerSchema, zodError } from "../../../../lib/schemas";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email นี้ถูกใช้งานแล้ว" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry  = new Date(Date.now() + 5 * 60000);

    await prisma.user.create({
      data: { email, name, password: hashedPassword, otp: otpCode, otpExpiry: expiry, role: "USER" },
    });

    return NextResponse.json({ otp: otpCode }, { status: 201 });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดที่ Server" }, { status: 500 });
  }
}
