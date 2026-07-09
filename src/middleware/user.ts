import { NextFunction } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export async function userMiddleware(ctx: MyContext, next: NextFunction) {
  if (ctx.from) {
    ctx.user = await prisma.user.findUnique({
      where: { telegramId: BigInt(ctx.from.id) }
    });
  }
  await next();
}
