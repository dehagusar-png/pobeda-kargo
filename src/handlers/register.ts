import { Composer, Keyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const registerHandler = new Composer<MyContext>();

const langMap: Record<string, string> = {
  "🇹🇯 Тоҷикӣ": "tg",
  "🇷🇺 Русский": "ru",
  "🇺🇿 O'zbek": "uz",
  "🇨🇳 中文": "zh"
};

registerHandler.hears(Object.keys(langMap), async (ctx) => {
  if (!ctx.from || !ctx.message?.text) return;
  const lang = langMap[ctx.message.text];
  await ctx.i18n.setLocale(lang);
  
  // Upsert user to save language
  await prisma.user.upsert({
    where: { telegramId: ctx.from.id },
    update: { language: lang, firstName: ctx.from.first_name, lastName: ctx.from.last_name },
    create: {
      telegramId: ctx.from.id,
      language: lang,
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name
    }
  });

  const kb = new Keyboard().requestContact(ctx.t("phone_button")).resized();
  await ctx.reply(ctx.t("ask_phone"), { reply_markup: kb });
});

registerHandler.on("message:contact", async (ctx) => {
  if (!ctx.from) return;
  const phone = ctx.message.contact.phone_number;
  
  // Get current user to check if they already have a code
  let user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id } });
  let clientCode = user?.clientCode;

  if (!clientCode) {
    const userCount = await prisma.user.count();
    clientCode = `PB-${1000 + userCount}`;
    user = await prisma.user.update({
      where: { telegramId: ctx.from.id },
      data: { phone, clientCode }
    });
  }

  const keyboard = new Keyboard()
    .text(ctx.t("address")).text(ctx.t("track")).row()
    .text(ctx.t("calculator")).text(ctx.t("support")).resized();

  await ctx.reply(ctx.t("registered", { clientCode }), { reply_markup: keyboard });
});
