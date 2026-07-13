import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { BUTTONS } from "../utils/constants";
import fs from "fs";
import path from "path";

export const calculatorHandler = new Composer<MyContext>();

function getPricingConfig() {
  try {
    const configPath = path.resolve(process.cwd(), "config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (e) {}
  
  return {
    weightTiers: [
      { min: 0, max: 30, price: 4.5 },
      { min: 30, max: 80, price: 4.0 },
      { min: 80, max: 999999, price: 3.5 }
    ],
    volumeTiers: [
      { min: 0, max: 1, price: 350 },
      { min: 1, max: 999999, price: 320 }
    ]
  };
}

function calculatePrice(value: number, type: 'weight' | 'volume') {
  const config = getPricingConfig();
  const tiers = type === 'weight' ? config.weightTiers : config.volumeTiers;
  
  let pricePerUnit = 0;
  for (const tier of tiers) {
    if (value >= tier.min && value <= tier.max) {
      pricePerUnit = tier.price;
      break;
    }
  }
  if (pricePerUnit === 0 && tiers.length > 0) {
    pricePerUnit = tiers[tiers.length - 1].price;
  }
  
  return { pricePerUnit, total: value * pricePerUnit };
}

calculatorHandler.hears([/Ҳисобкунак/i, /Калькулятор/i, /Kalkulyator/i, /计算器/i, /Calculator/i], async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("⚖️ Ҳисоб аз рӯи Вазн (Кг)", "calc_start_kg").row()
    .text("📦 Ҳаҷм аз рӯи Андоза (Дарозӣ x Паҳнӣ x Баландӣ)", "calc_start_m3");

  await ctx.reply("Чӣ гуна ҳисоб кардан мехоҳед?", { reply_markup: keyboard });
});

calculatorHandler.on("callback_query:data", async (ctx, next) => {
  if (ctx.callbackQuery.data === "calc_start_kg") {
    ctx.session.step = "calculator_kg";
    await ctx.editMessageText("⚖️ Лутфан вазни борро бо килограмм нависед (масалан: <code>15</code> ё <code>2.5</code>)", { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
  } else if (ctx.callbackQuery.data === "calc_start_m3") {
    ctx.session.step = "calculator_m3";
    await ctx.editMessageText("📦 Лутфан андозаи борро бо сантиметр нависед (масалан: <code>50x40x30</code>) ё куби тайёрро (масалан: <code>0.06</code>)", { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
  } else {
    await next();
  }
});

calculatorHandler.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "calculator_kg") {
    const text = ctx.message.text.trim().replace(/,/g, '.');
    const weight = parseFloat(text);
    
    if (isNaN(weight) || weight <= 0) {
      await ctx.reply("❌ Рақам нодуруст аст. Лутфан вазнро ворид кунед (масалан: <code>15</code>)", { parse_mode: "HTML" });
      return;
    }
    
    const result = calculatePrice(weight, 'weight');
    await ctx.reply(`⚖️ Вазн: <b>${weight} кг</b>\n💵 Нарх барои 1 кг: <b>$${result.pricePerUnit}</b>\n💰 Нархи умумии интиқол: <b>$${result.total.toFixed(2)}</b>`, { parse_mode: "HTML" });
    ctx.session.step = "";
  } 
  else if (ctx.session.step === "calculator_m3") {
    const text = ctx.message.text.trim().toLowerCase().replace(/х/g, 'x').replace(/\*/g, 'x').replace(/,/g, '.');
    
    let volume = 0;
    
    if (text.includes('x')) {
      const parts = text.split('x').map(p => parseFloat(p.trim()));
      if (parts.length === 3 && !parts.some(isNaN)) {
        volume = (parts[0]! * parts[1]! * parts[2]!) / 1_000_000;
      }
    } else {
      volume = parseFloat(text);
    }
    
    if (isNaN(volume) || volume <= 0) {
      await ctx.reply("❌ Формат нодуруст аст. Лутфан андозаро (масалан: <code>50x40x30</code>) ё кубро (масалан: <code>0.06</code>) ворид кунед.", { parse_mode: "HTML" });
      return;
    }
    
    const result = calculatePrice(volume, 'volume');
    await ctx.reply(`📦 Ҳаҷм: <b>${volume.toFixed(3)} м³</b>\n💵 Нарх барои 1 м³: <b>$${result.pricePerUnit}</b>\n💰 Нархи умумии интиқол: <b>$${result.total.toFixed(2)}</b>`, { parse_mode: "HTML" });
    ctx.session.step = "";
  }
  else {
    await next();
  }
});
