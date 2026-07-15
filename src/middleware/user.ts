import { NextFunction } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export async function userMiddleware(ctx: MyContext, next: NextFunction) {
  if (ctx.from) {
    try {
      ctx.user = await prisma.user.findUnique({
        where: { telegramId: BigInt(ctx.from.id) }
      });
    } catch (error) {
      console.error("Database connection error in userMiddleware:", error);
      // We don't block the next function, but ctx.user will be null/undefined.
      // Handlers checking for ctx.user will gracefully ask user to register or handle it.
      // Alternatively, we can notify the user that DB is busy.
      return ctx.reply("⚠️ Сервер дар ҳолати таъмир ё аз ҳад зиёд банд аст. Лутфан пас аз чанд дақиқа дубора кӯшиш кунед.");
    }
  }
  await next();
}
