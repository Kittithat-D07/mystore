// src/app/api/auth/[...nextauth]/route.ts
// ใช้ handlers จาก auth.ts กลาง ไม่สร้าง NextAuth instance ซ้ำ
import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
