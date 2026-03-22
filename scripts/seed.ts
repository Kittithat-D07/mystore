import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('?? ?????????? Seed ??????...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      email: 'admin@shop.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log(`? ????? Admin ?????????: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('? ??????????????????? Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
