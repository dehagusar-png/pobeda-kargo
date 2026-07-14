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
import { userMiddleware } from "./middleware/user";
import http from "http";

// Register middleware
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

// Fallback handler for unhandled messages
bot.on("message", async (ctx) => {
  await ctx.reply("❌ Узр, ман ин маълумотро нафаҳмидам. Лутфан маълумоти дуруст ворид кунед ё аз тугмаҳои меню истифода баред.\n\n🔄 Барои бозгашт ба менюи асосӣ: /start");
});

// Graceful shutdown to prevent 409 Conflict during zero-downtime deploys
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

import { GrammyError, HttpError } from "grammy";
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
