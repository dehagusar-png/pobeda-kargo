const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { firstName: { contains: '1001', mode: 'insensitive' } },
        { lastName: { contains: '1001', mode: 'insensitive' } },
        { username: { contains: '1001', mode: 'insensitive' } }
      ]
    }
  });
  console.log("Found users:", users.map(u => ({ id: u.id, name: u.firstName, username: u.username, telegramId: u.telegramId.toString(), role: u.role })));
}

main().finally(() => prisma.$disconnect());
