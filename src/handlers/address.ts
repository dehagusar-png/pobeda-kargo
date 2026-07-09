import { Composer } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const addressHandler = new Composer<MyContext>();

addressHandler.hears([
  "📍 Суроға дар Чин", "📍 Адрес в Китае", "📍 Xitoydagi manzil", "📍 中国仓库地址"
], async (ctx) => {
  if (!ctx.from) return;
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
  
  if (user && user.clientCode) {
    await ctx.reply(ctx.t("address_info", { 
      clientCode: user.clientCode,
      name: user.firstName || ""
    }), { parse_mode: "HTML" });
  } else {
    await ctx.reply("Лутфан аввал сабти ном кунед. / Пожалуйста зарегистрируйтесь. /start");
  }
});
