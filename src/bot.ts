import { Bot, Context, session, SessionFlavor } from "grammy";
import { I18n, I18nFlavor } from "@grammyjs/i18n";
import { User } from "@prisma/client";
import { prisma } from "./db";

// Define context flavor
interface SessionData {
  step: string;
  __language_code?: string;
  tempTrackCode?: string;
  calcCity?: 'dushanbe' | 'panjakent';
}
export type MyContext = Context & SessionFlavor<SessionData> & I18nFlavor & {
  user?: User | null;
};

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "");

import { limit } from "@grammyjs/ratelimiter";

// I18n setup
export const i18n = new I18n<MyContext>({
  defaultLocale: "tg",
  directory: "locales",
  useSession: true,
});

bot.use(session({ initial: () => ({}) }));
bot.use(i18n);

// Rate limiter (Anti-Spam)
bot.use(
  limit({
    timeFrame: 1000,
    limit: 3,
    onLimitExceeded: async (ctx) => {
      await ctx.reply("⚠️ Шумо хеле зуд паём фиристода истодаед. Лутфан оҳистатар!").catch(() => {});
    },
    keyGenerator: (ctx) => {
      return ctx.from?.id.toString();
    },
  })
);

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

// Error Tracking
bot.catch((err) => {
  const ctx = err.ctx;
  const e = err.error;
  console.error(`Error while handling update ${ctx.update.update_id}:`, e);
  
  // Send error to SuperAdmin (fallback to 8383689133)
  const superAdminId = process.env.SUPERADMIN_ID || "8383689133";
  let errorMessage = e instanceof Error ? e.message : String(e);
  
  bot.api.sendMessage(superAdminId, `🚨 <b>Хатогӣ дар Бот!</b>\n\n<pre>${errorMessage}</pre>`, { parse_mode: "HTML" }).catch(console.error);
});
