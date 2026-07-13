import { Composer } from "grammy";
import { MyContext } from "../bot";
import { BUTTONS } from "../utils/constants";

export const addressHandler = new Composer<MyContext>();

addressHandler.hears([/Суроға дар Чин/i, /Адрес в Китае/i, /Xitoydagi manzil/i, /中国仓库地址/i, /Address in China/i], async (ctx) => {
  if (!ctx.from) return;
  const user = ctx.user;
  
  if (user && user.clientCode) {
    await ctx.reply(ctx.t("address_info", { 
      clientCode: user.clientCode,
      name: user.firstName || ""
    }), { parse_mode: "HTML" });
  } else {
    await ctx.reply("Лутфан аввал сабти ном кунед. / Пожалуйста зарегистрируйтесь. /start");
  }
});
