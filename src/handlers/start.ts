import { Composer, Keyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const startHandler = new Composer<MyContext>();

startHandler.command("start", async (ctx) => {
  if (!ctx.from) return;
  const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id } });
  
  if (user && user.phone && user.clientCode) {
    // Already registered
    const keyboard = new Keyboard()
      .text(ctx.t("address")).text(ctx.t("track")).row()
      .text(ctx.t("calculator")).text(ctx.t("support")).row();
      
    // Агар корбар админ ё коргар бошад, тугмаи Сканер пайдо мешавад
    if (user.role === "ADMIN" || user.role === "WORKER") {
      keyboard.webApp("📸 Сканери Борҳо", "https://pobeda-scanner.vercel.app");
    }
    
    keyboard.resized();
      
    await ctx.reply(ctx.t("main_menu"), { reply_markup: keyboard });
  } else {
    // Not registered, ask language
    const kb = new Keyboard()
      .text("🇹🇯 Тоҷикӣ").text("🇷🇺 Русский").row()
      .text("🇺🇿 O'zbek").text("🇨🇳 中文").resized();
    await ctx.reply("Салом! Забонро интихоб кунед / Выберите язык / Tilni tanlang / 请选择语言", { reply_markup: kb });
  }
});
