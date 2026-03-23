"use server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

export async function preAuthCheck(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } }) as any;
  if (!user) return { error: "User not found" };

  // 🛡️ 1. เช็คการล็อค 30 นาที
  const now = new Date();
  if (user.lockUntil && user.lockUntil > now) {
    const diffInMins = Math.ceil((user.lockUntil.getTime() - now.getTime()) / 60000);
    return { error: `Account locked. Try again in ${diffInMins} min` };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // ❌ 2. รหัสผิด: อัปเดต DB และนับครั้ง
    const newAttempts = (user.loginAttempts || 0) + 1;
    let lockUntil = null;
    if (newAttempts >= 10) lockUntil = new Date(Date.now() + 30 * 60000);

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: newAttempts, lockUntil }
    });

    return { 
      error: newAttempts >= 10 
        ? "Max attempts reached. Locked for 30m" 
        : `Invalid password. Attempt ${newAttempts}/10` 
    };
  }

  // ✅ รีเซ็ต attempts เมื่อ login สำเร็จ
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, lockUntil: null }
  });

  return { success: true };
}