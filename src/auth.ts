import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";

const ADMIN_MAX_AGE = 15 * 60 * 1000;            // 15 นาที (ms)
const USER_MAX_AGE  = 30 * 24 * 60 * 60 * 1000;  // 30 วัน (ms)

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const now = new Date();
        if (user.lockUntil && user.lockUntil > now) return null;

        const isMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isMatch) {
          const newAttempts = (user.loginAttempts || 0) + 1;
          let lockUntilDate = null;
          if (newAttempts >= 10) {
            lockUntilDate = new Date(Date.now() + 30 * 60000);
          }
          await prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: newAttempts, lockUntil: lockUntilDate },
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockUntil: null },
        });

        return {
          id:    user.id,
          email: user.email,
          name:  user.name,
          role:  user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ตอน login ครั้งแรก
      if (user) {
        token.id      = user.id;
        token.role    = (user as any).role;
        token.loginAt = Date.now(); // ✅ บันทึกเวลา login
      }

      // ✅ เช็คหมดเวลาทุกครั้งที่มีการใช้ token
      const maxAge = token.role === "ADMIN" ? ADMIN_MAX_AGE : USER_MAX_AGE;
      const loginAt = token.loginAt as number;

      if (loginAt && Date.now() - loginAt > maxAge) {
        return null as any; // หมดเวลา → force logout
      }

      return token;
    },
    async session({ session, token }) {
      // ถ้า token null (หมดเวลา) → session จะไม่มีข้อมูล
      if (!token?.id) return null as any;

      if (session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // ceiling 30 วัน
  },
  pages: {
    signIn: "/login",
  },
});