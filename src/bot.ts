import { Bot, Context, session, SessionFlavor } from "grammy";
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { User } from "@prisma/client";
import { prisma } from "./db";

// Define context flavor
interface SessionData {
  step: string;
  __language_code?: string;
  tempTrackCode?: string;
}
export type MyContext = Context & SessionFlavor<SessionData> & I18nFlavor & {
  user?: User | null;
};

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "");

// I18n setup
export const i18n = new I18n<MyContext>({
  defaultLocale: "tg",
  directory: "locales",
  useSession: true,
});

bot.use(session({ initial: () => ({}) }));
bot.use(i18n);

// Language and user detection middleware
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
    if (user && user.language) {
      await ctx.i18n.setLocale(user.language);
    }
  }
  await next();
});
