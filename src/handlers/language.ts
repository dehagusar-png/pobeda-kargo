import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";
import { getMainKeyboard } from "../utils/keyboard";

export const languageHandler = new Composer<MyContext>();

const langKeywords = ["забон", "ивази забон", "язык", "сменить язык", "language", "change language", "til", "tilni o'zgartirish", "语言", "更改语言"];

languageHandler.hears(new RegExp(langKeywords.join("|"), "i"), async (ctx) => {
  await showLanguageKeyboard(ctx);
});

languageHandler.command(["lang", "language", "zabon"], async (ctx) => {
  await showLanguageKeyboard(ctx);
});

async function showLanguageKeyboard(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text("🇹🇯 Тоҷикӣ", "setlang_tg").text("🇷🇺 Русский", "setlang_ru").row()
    .text("🇺🇿 O'zbek", "setlang_uz").text("🇨🇳 中文", "setlang_zh").row()
    .text("🇺🇸 English", "setlang_en");

  await ctx.reply("Лутфан забонро интихоб кунед / Выберите язык / Tilni tanlang / 请选择语言 / Choose language:", {
    reply_markup: keyboard
  });
}

languageHandler.callbackQuery(/^setlang_(.+)$/, async (ctx) => {
  if (!ctx.from) return;
  const lang = ctx.match[1];
  if (!lang) return;
  
  // Supported languages
  if (!["tg", "ru", "uz", "zh", "en"].includes(lang)) {
    return ctx.answerCallbackQuery("Unsupported language.");
  }

  await ctx.i18n.setLocale(lang);
  
  // Update in DB
  try {
    await prisma.user.update({
      where: { telegramId: BigInt(ctx.from.id) },
      data: { language: lang }
    });
    // Also update context user object if it exists
    if (ctx.user) {
      ctx.user.language = lang;
    }
  } catch (err) {
    console.error("Failed to update language in DB", err);
  }

  const successMsgs: Record<string, string> = {
    "tg": "Забони тоҷикӣ интихоб шуд! ✅",
    "ru": "Выбран русский язык! ✅",
    "uz": "O'zbek tili tanlandi! ✅",
    "zh": "已选择中文！ ✅",
    "en": "English language selected! ✅"
  };

  await ctx.answerCallbackQuery(successMsgs[lang] || "Language changed!");
  
  // Get updated keyboard
  let user = ctx.user;
  if (!user) {
      user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
  }
  const mainKeyboard = getMainKeyboard(ctx, user || null);
  
  await ctx.editMessageText(successMsgs[lang] || "Language changed!");
  await ctx.reply(ctx.t("main_menu"), { reply_markup: mainKeyboard });
});
