import { Composer, InlineKeyboard } from "grammy";
import { MyContext, i18n } from "../bot";
import { BUTTONS } from "../utils/constants";

export const addressHandler = new Composer<MyContext>();

addressHandler.hears([/Суроға дар Чин/i, /Адрес в Китае/i, /Xitoydagi manzil/i, /中国仓库地址/i, /Address in China/i], async (ctx) => {
  if (!ctx.from) return;
  const user = ctx.user;
  
  if (user && user.clientCode) {
    const inlineKeyboard = new InlineKeyboard()
      .text("🇹🇯 Тоҷикӣ", `addr_lang_tg`)
      .text("🇷🇺 Русский", `addr_lang_ru`).row()
      .text("🇺🇿 O'zbekcha", `addr_lang_uz`)
      .text("🇨🇳 中文", `addr_lang_zh`);

    await ctx.reply("Суроғаро ба кадом забон дидан мехоҳед? / На каком языке хотите посмотреть адрес?", {
      reply_markup: inlineKeyboard
    });
  } else {
    await ctx.reply("Лутфан аввал сабти ном кунед. / Пожалуйста зарегистрируйтесь. /start");
  }
});

addressHandler.callbackQuery(/^addr_lang_(.+)$/, async (ctx) => {
  const lang = ctx.match[1] as string;
  const user = ctx.user;
  
  if (user && user.clientCode) {
    const msg = i18n.t(lang, "address_info", {
      clientCode: user.clientCode,
      name: user.firstName || "",
      phone: user.phone || ""
    });
    
    await ctx.editMessageText(msg, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
  } else {
    await ctx.answerCallbackQuery("Error");
  }
});
