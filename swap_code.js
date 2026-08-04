const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      clientCode: {
        in: ['PB-1001', 'PB-1002']
      }
    }
  });
  
  const pb1001 = users.find(u => u.clientCode === 'PB-1001');
  const pb1002 = users.find(u => u.clientCode === 'PB-1002');
  
  if (pb1001) {
    console.log("Found PB-1001:", pb1001.firstName, pb1001.telegramId);
    // Temporary change to free up PB-1001
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-TEMP' }
    });
  }
  
  if (pb1002) {
    console.log("Found PB-1002:", pb1002.firstName, pb1002.telegramId);
    // Change PB-1002 to PB-1001
    await prisma.user.update({
      where: { id: pb1002.id },
      data: { clientCode: 'PB-1001' }
    });
  }
  
  if (pb1001) {
    // Reassign old PB-1001 to PB-1002
    await prisma.user.update({
      where: { id: pb1001.id },
      data: { clientCode: 'PB-1002' }
    });
  }
  
  console.log("Successfully swapped PB-1001 and PB-1002");
}

main().catch(console.error).finally(() => prisma.$disconnect());
