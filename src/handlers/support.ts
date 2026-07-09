import { Composer } from "grammy";
import { MyContext } from "../bot";
import { BUTTONS } from "../utils/constants";

export const supportHandler = new Composer<MyContext>();

supportHandler.hears(BUTTONS.SUPPORT, async (ctx) => {
  await ctx.reply(ctx.t("support_text"), { parse_mode: "HTML" });
});
