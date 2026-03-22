import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 1. สุ่มเลข 6 หลัก
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 2. ตั้งเวลาหมดอายุ (5 นาทีจากตอนนี้)
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // 3. บันทึกลง Database ของ User คนนั้น
    await prisma.user.update({
      where: { email },
      data: {
        otp: otpCode,
        otpExpiry: expiry,
      },
    });

    // 4. ส่งเลขคืนไป (เพื่อเอาไปโชว์ในช่อง Mock Mode บนหน้าจอ Demo)
    return NextResponse.json({ otp: otpCode });
  } catch (error) {
    return NextResponse.json({ error: "ส่ง OTP ไม่สำเร็จ" }, { status: 500 });
  }
}