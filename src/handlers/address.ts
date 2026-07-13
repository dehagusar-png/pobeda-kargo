import { Composer } from "grammy";
import { MyContext, i18n } from "../bot";

export const addressHandler = new Composer<MyContext>();

async function sendAddress(ctx: MyContext, lang: string) {
  if (!ctx.from) return;
  const user = ctx.user;
  
  if (user && user.clientCode) {
    const msg = i18n.t(lang, "address_info", {
      clientCode: user.clientCode,
      name: user.firstName || "",
      phone: user.phone || ""
    });
    
    await ctx.reply(msg, { parse_mode: "HTML" });
  } else {
    // If they aren't registered, tell them to register
    const errMsg = lang === 'ru' ? "Пожалуйста зарегистрируйтесь. /start" 
                 : lang === 'uz' ? "Iltimos ro'yxatdan o'ting. /start"
                 : lang === 'zh' ? "请先注册。 /start"
                 : lang === 'en' ? "Please register first. /start"
                 : "Лутфан аввал сабти ном кунед. /start";
    await ctx.reply(errMsg);
  }
}

addressHandler.hears(/суроға/i, (ctx) => sendAddress(ctx, 'tg'));
addressHandler.hears(/адрес/i, (ctx) => sendAddress(ctx, 'ru'));
addressHandler.hears(/manzil/i, (ctx) => sendAddress(ctx, 'uz'));
addressHandler.hears(/address/i, (ctx) => sendAddress(ctx, 'en'));
addressHandler.hears(/地址/i, (ctx) => sendAddress(ctx, 'zh'));

// Keep the old button regexes just in case someone still has the old keyboard cached
addressHandler.hears(/Суроға дар Чин/i, (ctx) => sendAddress(ctx, 'tg'));
addressHandler.hears(/Адрес в Китае/i, (ctx) => sendAddress(ctx, 'ru'));
addressHandler.hears(/Xitoydagi manzil/i, (ctx) => sendAddress(ctx, 'uz'));
addressHandler.hears(/中国仓库地址/i, (ctx) => sendAddress(ctx, 'zh'));
addressHandler.hears(/Address in China/i, (ctx) => sendAddress(ctx, 'en'));
