import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { forgotPasswordSchema, zodError } from "../../../../lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // ไม่บอกว่า email มีหรือไม่มี (security best practice)
    if (!user) return NextResponse.json({ message: "ส่ง OTP แล้ว (ถ้ามี account)" });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000); // 10 นาที

    await prisma.user.update({ where: { email }, data: { otp, otpExpiry: expiry } });

    // Mock: return OTP (production ต้องส่ง email จริง)
    return NextResponse.json({ message: "ส่ง OTP แล้ว", otp });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
