const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: '+992928153531' },
    update: { role: 'ADMIN' },
    create: {
      phone: '+992928153531',
      telegramId: BigInt(Date.now()),
      role: 'ADMIN',
      language: 'tg',
      clientCode: 'PB-9999'
    }
  });
  console.log('User updated:', user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
