import { Composer } from "grammy";
import { MyContext } from "../bot";
import { BUTTONS } from "../utils/constants";

export const supportHandler = new Composer<MyContext>();

supportHandler.hears([/Дастгирӣ/i, /Поддержка/i, /Qo'llab-quvvatlash/i, /客服支持/i, /Support/i], async (ctx) => {
  await ctx.reply(ctx.t("support_text"), { parse_mode: "HTML" });
});
