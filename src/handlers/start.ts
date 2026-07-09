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
