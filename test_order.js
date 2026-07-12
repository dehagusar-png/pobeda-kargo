const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  const product = await prisma.product.findFirst();

  if (!user || !product) {
    console.log("No user or product found");
    return;
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: product.id,
      totalTJS: product.priceCNY * 1.5,
      status: "PENDING"
    }
  });
  
  console.log("Order created successfully:", order);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
