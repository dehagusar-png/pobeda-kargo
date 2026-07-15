const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } }
  });
  console.log(users.map(u => ({
    id: u.id,
    tg: u.telegramId.toString(),
    role: u.role,
    name: u.firstName,
    phone: u.phone
  })));
  await prisma.$disconnect();
}

main();
