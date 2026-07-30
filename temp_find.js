
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: '1001', mode: 'insensitive' } },
        { lastName: { contains: '1001', mode: 'insensitive' } },
        { firstName: { contains: 'PB', mode: 'insensitive' } },
        { firstName: { contains: 'РВ', mode: 'insensitive' } } // Cyrillic
      ]
    }
  });
  console.log("Found Users:", users.map(u => ({ name: u.firstName, telegramId: u.telegramId.toString(), role: u.role })));
}
main().finally(() => prisma.$disconnect());
    