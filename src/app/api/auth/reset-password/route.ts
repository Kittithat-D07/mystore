import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { resetPasswordSchema, zodError } from "../../../../lib/schemas";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { email, otp, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp) return NextResponse.json({ error: "OTP ไม่ถูกต้อง" }, { status: 400 });
    if (user.otpExpiry && new Date() > user.otpExpiry) return NextResponse.json({ error: "OTP หมดอายุแล้ว" }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashed, otp: null, otpExpiry: null, loginAttempts: 0, lockUntil: null } });

    return NextResponse.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
