import { Composer, Keyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";
import { LANG_MAP } from "../utils/constants";
import { getMainKeyboard } from "../utils/keyboard";

export const registerHandler = new Composer<MyContext>();

registerHandler.hears(Object.keys(LANG_MAP), async (ctx) => {
  if (!ctx.from || !ctx.message?.text) return;
  const lang = LANG_MAP[ctx.message.text] as string;
  await ctx.i18n.setLocale(lang);
  
  try {
    console.log(`Кӯшиши сабти забони ${lang} барои корбар ${ctx.from.id}...`);
    // Upsert user to save language
    await prisma.user.upsert({
      where: { telegramId: BigInt(ctx.from.id) },
      update: { language: lang, firstName: ctx.from.first_name, lastName: ctx.from.last_name || null },
      create: {
        telegramId: BigInt(ctx.from.id),
        language: lang,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name || null
      }
    });
    console.log(`Маълумот дар база муваффақона сабт шуд.`);

    const kb = new Keyboard().requestContact(ctx.t("phone_button")).resized();
    await ctx.reply(ctx.t("ask_phone"), { reply_markup: kb });
  } catch (error) {
    console.error("Хатогӣ ҳангоми сабт дар базаи маълумот:", error);
    await ctx.reply("❌ Хатогӣ дар базаи маълумоти сервер ба вуҷуд омад. Лутфан логҳои (Logs) серверро тафтиш кунед.");
  }
});

registerHandler.on("message:contact", async (ctx) => {
  if (!ctx.from) return;
  const phone = ctx.message.contact.phone_number;
  
  let user = ctx.user;
  let clientCode = user?.clientCode;

  if (!clientCode) {
    const userCount = await prisma.user.count();
    clientCode = `PB-${1000 + userCount}`;
    user = await prisma.user.update({
      where: { telegramId: BigInt(ctx.from.id) },
      data: { phone, clientCode }
    });
  }

  const keyboard = getMainKeyboard(ctx, user || null);
  await ctx.reply(ctx.t("registered", { clientCode }), { reply_markup: keyboard });
});
