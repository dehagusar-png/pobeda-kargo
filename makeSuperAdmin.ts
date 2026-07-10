import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERADMIN';`);
    console.log('Successfully added SUPERADMIN to enum');
  } catch(e: any) {
    console.log('Enum might already have SUPERADMIN or another error:', e.message);
  }

  try {
    await prisma.user.updateMany({
      where: { phone: { in: ['+992928153531', '79801868277'] } },
      data: { role: 'SUPERADMIN' }
    });
    console.log('Successfully set SUPERADMIN for users');
  } catch(e: any) {
    console.log('Error updating users:', e.message);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
