FROM node:20-alpine AS base

# --- STAGE 1: deps ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- STAGE 2: builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 💡 ส่วนที่เพิ่มเข้ามาเพื่อให้ Build ผ่าน:
# รับค่าจาก --build-arg มาตั้งเป็น ENV เพื่อให้ Next.js เชื่อมต่อ DB ตอน Build (ถ้าจำเป็น)
ARG DATABASE_URL
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# --- STAGE 3: runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy ไฟล์ที่จำเป็นสำหรับการรัน standalone mode
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# รันด้วย server.js (standalone output จาก Next.js)
<<<<<<< HEAD
CMD ["node", "server.js"]
=======
CMD ["node", "server.js"]
>>>>>>> 5ed122513a400bf9cc16b2900f18fe6f44d069b8
