const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { telegramId: BigInt('8383689133') }
  });
  console.log(user);
}

main().finally(() => prisma.$disconnect());
