import { Composer } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const receiptHandler = new Composer<MyContext>();

receiptHandler.on(["message:photo", "message:document"], async (ctx) => {
  // Acknowledge receipt to user
  await ctx.reply("✅ Ташаккур! Чеки шумо қабул шуд ва барои тасдиқ ба маъмурият фиристода шуд. Пас аз тасдиқ, фармоиши шумо қабул мегардад.");

  // Fetch all superadmins and admins
  const superAdmins = await prisma.user.findMany({ 
    where: { 
      OR: [
        { role: "SUPERADMIN" },
        { role: "ADMIN" }
      ]
    } 
  });
  
  const caption = `🧾 <b>Чек барои пардохт</b>\n\n` +
                  `👤 Корбар: ${ctx.from.first_name} ${ctx.from.last_name || ""}\n` +
                  `🆔 ID: <code>${ctx.from.id}</code>\n` +
                  `📞 Телефон: ${ctx.user?.phone || "Номаълум"}\n` +
                  `🕒 Вақт: ${new Date().toLocaleString("tg-TJ", { timeZone: "Asia/Dushanbe" })}`;

  for (const admin of superAdmins) {
    if (admin.telegramId) {
      try {
        await ctx.copyMessage(admin.telegramId.toString(), {
          caption: caption,
          parse_mode: "HTML",
        });
      } catch (err) {
        console.error(`Failed to send receipt to admin ${admin.telegramId}`, err);
      }
    }
  }
});
