import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAdmin } from "../../../lib/apiAuth";
import { uploadSchema, zodError } from "../../../lib/schemas";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = uploadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

    const { base64, fileName } = parsed.data;
    const buffer = Buffer.from(base64.split(",")[1] || base64, "base64");

    // ✅ เช็คขนาดไฟล์
    if (buffer.length > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกิน 5MB" }, { status: 400 });
    }

    const uniqueName = Date.now() + "-" + fileName.replace(/[^a-zA-Z0-9._-]/g, "");
    const uploadDir  = path.join(process.cwd(), "public/uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
