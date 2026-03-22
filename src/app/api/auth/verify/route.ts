import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { otpSchema, zodError } from "../../../../lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = otpSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { email, otp } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp) return NextResponse.json({ error: "รหัส OTP ไม่ถูกต้อง" }, { status: 400 });
    if (user.otpExpiry && new Date() > user.otpExpiry) return NextResponse.json({ error: "รหัส OTP หมดอายุแล้ว" }, { status: 400 });

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date(), otp: null, otpExpiry: null } });
    return NextResponse.json({ message: "ยืนยันสำเร็จ" });
  } catch {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
