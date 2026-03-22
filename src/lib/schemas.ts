import { z } from "zod";

export const registerSchema = z.object({
  name:     z.string().min(1, "กรุณากรอกชื่อ").max(100),
  email:    z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").max(100),
});

export const loginSchema = z.object({
  email:    z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const productSchema = z.object({
  name:        z.string().min(1, "กรุณากรอกชื่อสินค้า").max(200),
  sku:         z.string().min(1, "กรุณากรอก SKU").max(50),
  price:       z.coerce.number().min(0, "ราคาต้องไม่ติดลบ"),
  stock:       z.coerce.number().int().min(0, "สต็อกต้องไม่ติดลบ"),
  description: z.string().max(2000).optional(),
  images:      z.array(z.string().min(1)).optional(),
  // ✅ แก้: string ว่าง หรือ null → แปลงเป็น null
  categoryId:  z.string().uuid().nullable().optional()
    .transform((val) => (val === "" || val === null || val === undefined) ? null : val),
});

export const orderSchema = z.object({
  items: z.array(z.object({
    id:       z.string().uuid(),
    price:    z.number().min(0),
    quantity: z.number().int().min(1),
  })).min(1, "ไม่มีสินค้าใน cart"),
  totalAmount:     z.number().min(0),
  shippingName:    z.string().min(1, "กรุณากรอกชื่อผู้รับ"),
  shippingPhone:   z.string().min(9, "เบอร์โทรไม่ถูกต้อง"),
  shippingAddress: z.string().min(10, "กรุณากรอกที่อยู่ให้ครบถ้วน"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ category").max(100),
});

export const profileNameSchema = z.object({
  name: z.string().min(1, "ชื่อต้องไม่ว่าง").max(100),
});

export const profilePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const uploadSchema = z.object({
  base64:   z.string().min(1),
  fileName: z.string().min(1).max(255)
    .regex(/\.(jpg|jpeg|png|gif|webp)$/i, "รองรับเฉพาะไฟล์รูปภาพ"),
});

export const otpSchema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6, "OTP ต้องมี 6 หลัก").regex(/^\d+$/, "OTP ต้องเป็นตัวเลขเท่านั้น"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
});

export const resetPasswordSchema = z.object({
  email:       z.string().email(),
  otp:         z.string().length(6).regex(/^\d+$/),
  newPassword: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

// ✅ แก้: รับได้ทั้ง ZodError และ Error ทั่วไป
export function zodError(error: z.ZodError) {
  const msg = error.errors?.[0]?.message || "ข้อมูลไม่ถูกต้อง";
  return { error: msg, fields: error.flatten().fieldErrors };
}
