import "dotenv/config";
import { bot } from "./bot";
import { startHandler } from "./handlers/start";
import { registerHandler } from "./handlers/register";
import { addressHandler } from "./handlers/address";
import { calculatorHandler } from "./handlers/calculator";
import { trackHandler } from "./handlers/track";
import http from "http";

// Register handlers
bot.use(startHandler);
bot.use(registerHandler);
bot.use(addressHandler);
bot.use(calculatorHandler);
bot.use(trackHandler);

import { GrammyError, HttpError } from "grammy";
bot.catch((err) => {
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
