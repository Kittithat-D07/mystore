import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;   // ✅ เพิ่มเพื่อให้ระบบตะกร้าหา ID เจอ
      role: string; // ✅ เพิ่มเพื่อให้ระบบ Admin เช็คสิทธิ์ได้
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}