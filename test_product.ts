import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.create({
    data: {
      title: "Сумкаи занонаи замонавӣ",
      priceCNY: 150.50,
      image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&auto=format&fit=crop&q=60",
      isActive: true,
      description: "Сумкаи хеле зебо ва босифат барои хонумҳо. Истеҳсоли Чин."
    }
  });
  
  console.log("Added product successfully:", product);
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
