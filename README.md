# 🛍️ MyStore — Full-Stack E-Commerce Platform

ระบบร้านค้าออนไลน์ครบวงจร พัฒนาด้วย **Next.js 15 App Router** รองรับทั้งฝั่งผู้ใช้งานและ Admin Panel พร้อม Real-time Chat และระบบ Security ระดับ Production

---

## ✨ Features

### 👤 ระบบ Authentication
- **Register** พร้อมยืนยัน Email ด้วย OTP 6 หลัก (หมดอายุ 5 นาที)
- **Login** พร้อม Brute-force Protection — ล็อค account 30 นาทีหลังพิมพ์รหัสผิด 10 ครั้ง
- **Forgot Password** รีเซ็ตรหัสผ่านผ่าน OTP 3 ขั้นตอน
- **Session Timeout** — Admin หมดเวลา 15 นาที, User หมดเวลา 30 วัน
- **Email Verification** ต้องยืนยันก่อนใช้งาน

### 🛒 ร้านค้า (User)
- หน้าแสดงสินค้าพร้อม **Filter by Category** และ **Full-text Search**
- หน้า Product Detail พร้อม **Image Gallery** หลายรูป
- **Shopping Cart** (persisted ใน localStorage) — เพิ่ม/ลด/ลบสินค้า
- **Checkout** กรอกชื่อ เบอร์โทร ที่อยู่จัดส่ง
- **Order History** ดูประวัติและยกเลิก order ที่ยัง PENDING ได้
- **Profile** แก้ไขชื่อและเปลี่ยนรหัสผ่าน

### 🔧 Admin Panel
- **Dashboard** — Stats (รายได้, orders, users, products) + Sales Chart 7 วัน
- **Product Management** — เพิ่ม/แก้ไข/ลบสินค้า, อัพโหลดรูป, toggle เปิด/ปิดขาย
- **Order Management** — ดูทุก order, filter ตามสถานะ, เปลี่ยนสถานะ, ดู order detail พร้อม timeline
- **Category Management** — เพิ่ม/แก้ไข/ลบ category, ดูสินค้าในหมวด
- **User Management** — promote/demote role, activate/deactivate, unlock account
- **Live Chat** — ตอบลูกค้าแบบ Real-time

### 💬 Real-time Chat
- ใช้ **Server-Sent Events (SSE)** สำหรับ push message
- Floating chat widget สำหรับ user ทุกหน้า
- Admin chat panel แยกต่างหาก พร้อมแสดง unread count
- Auto-reconnect เมื่อ connection ขาด
- Mark as read อัตโนมัติ

### 🔒 Security
- **Brute-force Protection** — `loginAttempts` counter + `lockUntil` timestamp ใน DB
- **OTP System** — สุ่ม 6 หลัก, หมดอายุตามเวลา, hash ไม่ได้เก็บ plain text
- **Role-based Access Control** — middleware guard ทุก route
- **Password Hashing** — bcryptjs salt rounds 10
- **Input Validation** — Zod schema ทุก API endpoint
- **File Upload Security** — เช็ค MIME type, จำกัดขนาด 5MB
- **Atomic Stock Decrement** — ใช้ `prisma.$transaction` ป้องกัน race condition

---

## 🧰 Tech Stack

| Category | Technology | เหตุผลที่เลือก |
|----------|-----------|--------------|
| Framework | Next.js 15 (App Router) | Server Components, ISR, file-based routing |
| Language | TypeScript | Type safety ลด runtime errors |
| Auth | NextAuth.js v5 | Session management, JWT strategy |
| ORM | Prisma | Type-safe DB queries, schema migration |
| Database | PostgreSQL | Relational data, ACID transactions |
| Styling | Tailwind CSS + Inline Styles | Utility-first + component isolation |
| Real-time | Server-Sent Events (SSE) | One-direction push, เบากว่า WebSocket |
| Validation | Zod | Schema validation ทั้ง client และ server |
| Charts | Recharts | React-native chart components |
| Icons | Lucide React | Consistent icon set |
| Containerization | Docker + Docker Compose | Reproducible environment |
| Password | bcryptjs | Industry-standard hashing |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Register, Forgot Password, Verify Email
│   ├── (main)/              # Shop, Cart, Checkout, Orders, Profile, Chat
│   │   └── product/[id]/    # Product detail page (SSR + revalidate)
│   ├── admin/               # Admin Panel (Dashboard, Orders, Categories, Users, Chat)
│   │   └── orders/[id]/     # Order detail with timeline
│   └── api/                 # API Routes
│       ├── auth/            # Register, Verify, OTP, Reset Password
│       ├── products/        # CRUD + image upload
│       ├── orders/          # Create order (transaction), status update
│       ├── categories/      # CRUD
│       ├── chat/            # Messages + SSE stream
│       ├── users/           # User management
│       └── profile/         # Update name/password
├── components/              # Shared UI Components
│   ├── Navbar.tsx           # Sticky nav + search + cart badge
│   ├── FloatingChat.tsx     # Real-time chat widget
│   ├── Toast.tsx            # Notification system
│   ├── ProductCard.tsx      # Product grid card
│   ├── ImageGallery.tsx     # Multi-image viewer
│   └── ...
├── context/
│   └── CartContext.tsx      # Cart state (localStorage persist)
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── schemas.ts           # Zod validation schemas
│   ├── apiAuth.ts           # requireAdmin / requireAuth helpers
│   └── types.ts             # TypeScript interfaces
├── auth.ts                  # NextAuth configuration
└── proxy.ts                 # Middleware (route protection)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Git

### 1. Clone & Install
```bash
git clone https://github.com/username/mystore.git
cd mystore
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```

แก้ไข `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopdb_prod?schema=public"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start Database
```bash
docker compose up -d
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 🐳 Production Deployment

### ด้วย Docker Compose (All-in-one)
```bash
# Build และรัน app + database พร้อมกัน
docker compose -f docker-compose-prod.yml up -d --build
```

อย่าลืมแก้ `NEXTAUTH_URL` ใน `docker-compose-prod.yml` ให้ตรงกับ domain จริง

### Environment ที่ต้องแก้ก่อน deploy
```yaml
NEXTAUTH_SECRET: "strong-random-secret-min-32-chars"
NEXTAUTH_URL: "https://yourdomain.com"
POSTGRES_PASSWORD: "strong-db-password"
```

---

## 📊 Database Schema

```
User          — id, email, password, name, role, otp, loginAttempts, lockUntil
Product       — id, sku, name, price, stock, images[], isActive, categoryId
Category      — id, name
Order         — id, status, totalAmount, shippingInfo, userId
OrderItem     — id, quantity, price, orderId, productId
Message       — id, content, isAdmin, read, userId
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | สมัครสมาชิก | Public |
| POST | `/api/auth/verify` | ยืนยัน OTP | Public |
| POST | `/api/auth/forgot-password` | ขอ OTP reset | Public |
| POST | `/api/auth/reset-password` | เปลี่ยนรหัสผ่าน | Public |
| GET | `/api/products` | ดูสินค้าทั้งหมด | Public |
| POST | `/api/products` | เพิ่มสินค้า | Admin |
| PUT | `/api/products/[id]` | แก้ไขสินค้า | Admin |
| DELETE | `/api/products/[id]` | ลบสินค้า | Admin |
| POST | `/api/orders` | สร้าง order | User |
| PATCH | `/api/orders/[id]` | เปลี่ยนสถานะ | Admin |
| PUT | `/api/orders/[id]` | ยกเลิก order | User (owner) |
| GET | `/api/chat` | ดูประวัติแชท | User/Admin |
| POST | `/api/chat` | ส่งข้อความ | User/Admin |
| GET | `/api/chat/stream` | SSE connection | User/Admin |
| PATCH | `/api/users/[id]` | จัดการ user | Admin |

---

## ⚡ Performance

- **ISR (Incremental Static Regeneration)** — หน้าหลัก revalidate ทุก 30 วินาที, product detail 60 วินาที
- **Admin force-dynamic** — Admin pages ดึงข้อมูล real-time ทุกครั้ง
- **Promise.all** — Parallel data fetching บน Server Components
- **Loading Skeleton** — Admin panel มี skeleton UI ระหว่างโหลด
- **Prisma.$transaction** — Atomic operations ป้องกัน race condition
- **localStorage Cart** — Cart ไม่หายเมื่อ refresh

---

## 📝 License

MIT
