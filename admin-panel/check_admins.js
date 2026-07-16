const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.parcel.delete({
    where: { trackCode: '📊 Панели Маъмурият' }
  });
  console.log('Deleted fake parcel');
}

main().finally(() => prisma.$disconnect());
