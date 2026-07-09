import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";

export const calculatorHandler = new Composer<MyContext>();

const PRICE_PER_KG = 4.5; // $4.5 барои 1 кг
const PRICE_PER_CUBE = 350; // $350 барои 1 куб

calculatorHandler.hears([
  "🧮 Ҳисобкунак", "🧮 Калькулятор", "🧮 Kalkulyator", "🧮 计算器"
], async (ctx) => {
  ctx.session.step = "calculator";
  await ctx.reply("Барои ҳисоб кардани нарх:\n\n1️⃣ Агар танҳо вазн ё ҳаҷмро медонед, як рақам нависед (масалан: <code>15</code>)\n2️⃣ Агар ҳардуяшро медонед, бо фосила нависед (масалан: <code>15 0.5</code>)", { parse_mode: "HTML" });
});

calculatorHandler.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "calculator") {
    const text = ctx.message.text.trim().replace(/,/g, '.');
    
    // Ду рақам ворид шуд (Вазн ва Ҳаҷм)
    const matchTwo = text.match(/^([\d\.]+)\s+([\d\.]+)$/);
    if (matchTwo) {
      const weight = parseFloat(matchTwo[1]);
      const volume = parseFloat(matchTwo[2]);
      
      const weightPrice = weight * PRICE_PER_KG;
      const volumePrice = volume * PRICE_PER_CUBE;
      const finalPrice = Math.max(weightPrice, volumePrice);
      
      await ctx.reply(ctx.t("calc_result", {
        weight: weight.toFixed(2),
        volume: volume.toFixed(3),
        weightPrice: weightPrice.toFixed(2),
        volumePrice: volumePrice.toFixed(2),
        finalPrice: finalPrice.toFixed(2)
      }), { parse_mode: "HTML" });
      
      ctx.session.step = "";
      return;
    }
    
    // Як рақам ворид шуд (Мизоҷ мехоҳад танҳо якеашро бинад)
    const matchOne = text.match(/^([\d\.]+)$/);
    if (matchOne) {
      const value = parseFloat(matchOne[1]);
      const keyboard = new InlineKeyboard()
        .text("⚖️ Вазн (Кг)", `calc_kg_${value}`)
        .text("📦 Ҳаҷм (М³)", `calc_m3_${value}`);
        
      await ctx.reply(`Шумо рақами <b>${value}</b>-ро ворид кардед.\nЛутфан интихоб кунед, ки ин вазн аст ё ҳаҷм:`, {
        parse_mode: "HTML",
        reply_markup: keyboard
      });
      return;
    }

    await ctx.reply("❌ Лутфан рақамро дуруст ворид кунед (масалан: <code>15</code> ё <code>15 0.5</code>)", { parse_mode: "HTML" });
  } else {
    await next();
  }
});

// Идоракунии пахши тугмаҳои Inline
calculatorHandler.on("callback_query:data", async (ctx, next) => {
  if (ctx.callbackQuery.data.startsWith("calc_kg_")) {
    const weight = parseFloat(ctx.callbackQuery.data.replace("calc_kg_", ""));
    const price = weight * PRICE_PER_KG;
    await ctx.editMessageText(`⚖️ Вазн: <b>${weight} кг</b>\n💰 Нархи интиқол: <b>$${price.toFixed(2)}</b>`, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
    ctx.session.step = "";
  } else if (ctx.callbackQuery.data.startsWith("calc_m3_")) {
    const volume = parseFloat(ctx.callbackQuery.data.replace("calc_m3_", ""));
    const price = volume * PRICE_PER_CUBE;
    await ctx.editMessageText(`📦 Ҳаҷм: <b>${volume} м³</b>\n💰 Нархи интиқол: <b>$${price.toFixed(2)}</b>`, { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
    ctx.session.step = "";
  } else {
    await next();
  }
});
