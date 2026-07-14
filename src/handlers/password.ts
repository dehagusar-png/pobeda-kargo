import { Composer } from "grammy";
import { MyContext } from "../bot";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export const passwordHandler = new Composer<MyContext>();

passwordHandler.command("setpassword", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    await ctx.reply("❌ Шумо ҳуқуқи иваз кардани паролро надоред.");
    return;
  }

  const password = ctx.match;
  if (!password || password.trim().length < 6) {
    await ctx.reply("⚠️ Лутфан паролро ворид кунед (на камтар аз 6 ҳарф/рақам).\nНамуна: <code>/setpassword admin123</code>", { parse_mode: "HTML" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    await prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: { password: hashedPassword },
    });

    await ctx.reply("✅ Пароли шумо бо муваффақият иваз карда шуд! Акнун шумо метавонед бо ин парол ба админ-панел ворид шавед.\n\n⚠️ Лутфан ин паёмро барои бехатарӣ нест кунед.");
  } catch (error) {
    console.error("Error setting password:", error);
    await ctx.reply("❌ Хатогӣ ҳангоми нигоҳ доштани парол.");
  }
});
