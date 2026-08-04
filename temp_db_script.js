
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { clientCode: { in: ['PB-1001', 'PB-1002'] } }
  });
  
  const pb1001 = users.find(u => u.clientCode === 'PB-1001');
  const pb1002 = users.find(u => u.clientCode === 'PB-1002');
  
  if (pb1001) {
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-TEMP' }
    });
  }
  
  if (pb1002) {
    await prisma.user.update({
      where: { id: pb1002.id },
      data: { clientCode: 'PB-1001' }
    });
  }
  
  if (pb1001) {
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-1002' }
    });
  }
  console.log("SUCCESS");
}
main().finally(() => prisma.$disconnect());
  