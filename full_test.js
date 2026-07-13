const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("=== Оғози тести пурраи фармоиш ===");

  // 1. Пайдо кардани муштарӣ ва мол
  const user = await prisma.user.findFirst();
  const product = await prisma.product.findFirst();

  if (!user || !product) {
    console.log("Муштарӣ ё мол ёфт нашуд!");
    return;
  }

  // 2. Муштарӣ фармоиш медиҳад (тугмаи "Фармоиш додан" дар бот)
  console.log("\n1️⃣ Муштарӣ тугмаи 'Фармоиш додан'-ро пахш кард...");
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      productId: product.id,
      totalTJS: product.priceCNY * 1.5,
      status: "PENDING"
    }
  });
  console.log(`✅ Фармоиш бомуваффақият сабт шуд! ID-и фармоиш: #${order.id}, Ҳолат: ${order.status}`);

  // 3. Админ фармоишро дар панел мебинад ва статусро ба PURCHASED иваз мекунад
  console.log("\n2️⃣ Админ бо муштарӣ тамос гирифт ва пулро гирифт.");
  console.log("Админ дар панел ҳолати фармоишро ба 'Харида шуд (PURCHASED)' иваз мекунад...");
  
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PURCHASED" }
  });
  
  console.log(`✅ Фармоиш навсозӣ шуд! ID: #${updatedOrder.id}, Ҳолати нав: ${updatedOrder.status}`);

  // 4. (Ихтиёрӣ) Агар админ хоҳад, метавонад трек-коди молро бахшида ба ин харид дар бахши "Борҳо" илова кунад.
  console.log("\n3️⃣ Раванд ба охир расид! Акнун вақте мол ба анбори Чин мерасад, админ трек-коди онро ба система ворид мекунад.");
  
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
