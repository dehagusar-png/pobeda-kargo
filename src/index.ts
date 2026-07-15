import "dotenv/config";
import { bot } from "./bot";
import { startHandler } from "./handlers/start";
import { registerHandler } from "./handlers/register";
import { addressHandler } from "./handlers/address";
import { calculatorHandler } from "./handlers/calculator";
import { trackHandler } from "./handlers/track";
import { addParcelHandler } from "./handlers/addParcel";
import { supportHandler } from "./handlers/support";
import { languageHandler } from "./handlers/language";
import { marketplaceHandler } from "./handlers/marketplace";
import { passwordHandler } from "./handlers/password";
import { adminHandler } from "./handlers/admin";
import { receiptHandler } from "./handlers/receipt";
import { userMiddleware } from "./middleware/user";
import http from "http";

import { limit } from "@grammyjs/ratelimiter";

// Register middleware
bot.use(limit({
  timeFrame: 1000,
  limit: 5,
  // storageClient is omitted, which makes it default to internal Memory Store
  onLimitExceeded: async (ctx) => {
    await ctx.reply("⚠️ Лутфан зуд-зуд тугмаҳоро пахш накунед. 1 сония интизор шавед.");
  },
  keyGenerator: (ctx) => ctx.from?.id.toString(),
}));
bot.use(userMiddleware);

// Register handlers
bot.use(startHandler);
bot.use(languageHandler);
bot.use(marketplaceHandler);
bot.use(registerHandler);
bot.use(addressHandler);
bot.use(calculatorHandler);
bot.use(trackHandler);
bot.use(addParcelHandler);
bot.use(supportHandler);
bot.use(passwordHandler);
bot.use(adminHandler);
bot.use(receiptHandler);

// Fallback handler for unhandled messages
bot.on("message", async (ctx) => {
  await ctx.reply("❌ Узр, ман ин маълумотро нафаҳмидам. Лутфан маълумоти дуруст ворид кунед ё аз тугмаҳои меню истифода баред.\n\n🔄 Барои бозгашт ба менюи асосӣ: /start");
});

// Graceful shutdown to prevent 409 Conflict during zero-downtime deploys
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

import { GrammyError, HttpError } from "grammy";
import { prisma } from "./db";

bot.catch(async (err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }

  try {
    if (ctx.chat) {
      await ctx.reply("⚠️ Узр, муваққатан хатогӣ ба вуҷуд омад (шояд сервер банд аст). Лутфан якчанд сония интизор шавед ва аз нав кӯшиш кунед.");
    }
  } catch (replyError) {
    console.error("Failed to send error message to user:", replyError);
  }
  
  // Notify superadmin
  try {
    const superAdmins = await prisma.user.findMany({ where: { role: "SUPERADMIN" } });
    for (const admin of superAdmins) {
      if (admin.telegramId) {
        await ctx.api.sendMessage(
          admin.telegramId.toString(), 
          `🚨 <b>ХАТОГӢ ДАР БОТ!</b>\n\n<b>Хатогӣ:</b> ${e instanceof Error ? e.message : e}\n\nЛутфан серверро тафтиш кунед.`,
          { parse_mode: "HTML" }
        ).catch(() => {});
      }
    }
  } catch (dbError) {
    console.error("Failed to fetch superadmins for error notification:", dbError);
  }
});
// Start bot
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} started!`);
  }
});

// Dummy HTTP server to satisfy Render's port binding and UptimeRobot pings
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Pobeda Cargo Bot is running!\n");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
