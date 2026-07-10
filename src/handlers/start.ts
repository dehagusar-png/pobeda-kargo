import { Composer, Keyboard } from "grammy";
import { MyContext } from "../bot";
import { getMainKeyboard } from "../utils/keyboard";

export const startHandler = new Composer<MyContext>();

startHandler.command("start", async (ctx) => {
  if (!ctx.from) return;
  const user = ctx.user;
  
  if (user && user.phone && user.clientCode) {
    // Already registered
    const keyboard = getMainKeyboard(ctx, user);
    await ctx.reply(ctx.t("main_menu"), { reply_markup: keyboard });
  } else {
    // Not registered, ask language
    const kb = new Keyboard()
      .text("🇹🇯 Тоҷикӣ").text("🇷🇺 Русский").row()
      .text("🇺🇿 O'zbek").text("🇨🇳 中文").resized();
    await ctx.reply("Салом! Забонро интихоб кунед / Выберите язык / Tilni tanlang / 请选择语言", { reply_markup: kb });
  }
});

startHandler.command("setadmin", async (ctx) => {
  if (!ctx.from) return;
  try {
    const user = await import("../db").then(m => m.prisma.user.update({
      where: { telegramId: BigInt(ctx.from.id) },
      data: { role: "ADMIN" }
    }));
    if (ctx.user) ctx.user.role = "ADMIN";
    const keyboard = getMainKeyboard(ctx, user);
    await ctx.reply("✅ Шумо акнун ADMIN ҳастед! Тугмаи сканер дар поён пайдо шуд.", { reply_markup: keyboard });
  } catch (error) {
    await ctx.reply("❌ Хатогӣ ҳангоми иваз кардани нақш. Шояд шумо ҳанӯз пурра сабти ном нашудаед (рақами телефонро нафиристодаед). Аввал сабти ном шавед ва сипас /setadmin-ро пахш кунед.");
  }
});
