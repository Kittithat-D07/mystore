import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

// Global map เก็บ SSE connections แยกตาม userId
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(controller);
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  clients.get(userId)?.delete(controller);
  if (clients.get(userId)?.size === 0) clients.delete(userId);
}

// ส่ง event ไปหา user คนนั้น
export function sendToUser(userId: string, data: object) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  userClients.forEach((ctrl) => {
    try { ctrl.enqueue(new TextEncoder().encode(msg)); } catch {}
  });
}

// ส่ง event ไปหา admin ทุกคน (key = "admin")
export function sendToAdmins(data: object) {
  sendToUser("admin", data);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId   = session.user.role === "ADMIN" ? "admin" : session.user.id;
  const userName = session.user.name || session.user.email || "Unknown";

  const stream = new ReadableStream({
    start(controller) {
      addClient(userId, controller);

      // ส่ง ping ทันทีเพื่อเปิด connection
      const ping = `data: ${JSON.stringify({ type: "ping", userId: session.user.id, name: userName })}\n\n`;
      controller.enqueue(new TextEncoder().encode(ping));

      // Heartbeat ทุก 25 วินาที ป้องกัน connection timeout
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeClient(userId, controller);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
