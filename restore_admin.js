const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { phone: '79801868277' },
    data: { role: 'SUPERADMIN' }
  });
  console.log('Restored Murodov_QS to SUPERADMIN');
  await prisma.$disconnect();
}

main();
