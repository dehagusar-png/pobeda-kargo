import { Composer } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const marketplaceHandler = new Composer<MyContext>();

marketplaceHandler.on("message:web_app_data", async (ctx, next) => {
  try {
    const dataString = ctx.message.web_app_data.data;
    const data = JSON.parse(dataString);
    
    if (data.action === "buy" && data.productId) {
      if (!ctx.from) return;
      const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
      
      if (!user) {
        return ctx.reply("Аввал сабти ном шавед / Сначала зарегистрируйтесь");
      }

      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (!product) return ctx.reply("❌ Мол ёфт нашуд / Товар не найден");

      const settings = await prisma.settings.findUnique({ where: { id: 1 } });
      const rate = settings?.exchangeRate || 1.5;
      const priceTJS = product.priceCNY * rate;

      await prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          totalTJS: priceTJS,
          status: "PENDING"
        }
      });

      const successMsg = `✅ <b>Фармоиши шумо бомуваффақият сабт шуд!</b>\n\n` + 
                         `📦 <b>Мол:</b> ${product.title}\n` + 
                         `💰 <b>Нарх:</b> ${priceTJS.toFixed(2)} Сомонӣ\n\n` + 
                         `Менеҷерҳои мо ба зудӣ барои тасдиқи фармоиш бо шумо тамос мегиранд. Ташаккур барои интихобатон!`;
                         
      await ctx.reply(successMsg, { parse_mode: "HTML" });
    } else {
      await next();
    }
  } catch (e) {
    // If it's not valid JSON or not for us, pass to next handler
    await next();
  }
});
