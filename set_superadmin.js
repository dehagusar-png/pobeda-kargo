const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const phoneToFind = '+992929121999';
  
  // Find the user by phone
  let user = await prisma.user.findFirst({
    where: { phone: { contains: '929121999' } }
  });

  if (!user) {
    console.log("Корбар бо ин рақам ёфт нашуд!");
    return;
  }

  // Update role to SUPERADMIN
  user = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPERADMIN' }
  });

  console.log(`Муваффақият! Корбар ${user.firstName} (ID: ${user.telegramId}) ба SUPERADMIN табдил ёфт.`);
  console.log(`Telegram ID: ${user.telegramId}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
