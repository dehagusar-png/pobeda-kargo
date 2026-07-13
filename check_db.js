const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.findMany({ orderBy: { id: 'desc' }, take: 2 }).then(p => {
  console.log(p);
  prisma.$disconnect();
});
