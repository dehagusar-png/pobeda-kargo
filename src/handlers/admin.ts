import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";

export const adminHandler = new Composer<MyContext>();

adminHandler.hears("📊 Панели Маъмурият", async (ctx) => {
  if (ctx.user?.role !== "ADMIN" && ctx.user?.role !== "SUPERADMIN") {
    return;
  }

  const inlineKeyboard = new InlineKeyboard().webApp(
    "🔓 Вуруд ба Панел",
    "https://pobeda-admin-panel.onrender.com/login"
  );

  await ctx.reply("Барои вуруд ба панели маъмурият тугмаи зерро пахш кунед:", {
    reply_markup: inlineKeyboard,
  });
});
