import { Composer } from "grammy";
import { MyContext } from "../bot";

export const supportHandler = new Composer<MyContext>();

supportHandler.hears([
  "🎧 Дастгирӣ", "🎧 Поддержка", "🎧 Qo'llab-quvvatlash", "🎧 客服支持"
], async (ctx) => {
  await ctx.reply(ctx.t("support_text"), { parse_mode: "HTML" });
});
