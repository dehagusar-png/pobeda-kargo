import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { BUTTONS } from "../utils/constants";
import { prisma } from "../db";

export const calculatorHandler = new Composer<MyContext>();

async function getPricingConfig() {
  try {
    const settings = await prisma.settings.findFirst({
      where: { id: 1 }
    });
    
    if (settings && settings.pricingData) {
      return settings.pricingData as any;
    }
  } catch (e) {
    console.error("Failed to load pricing config from DB", e);
  }
  
  return {
    dushanbe: {
      weightTiers: [
        { min: 0, max: 30, price: 4.5 },
        { min: 30, max: 80, price: 4.0 },
        { min: 80, max: 999999, price: 3.5 }
      ],
      volumeTiers: [
        { min: 0, max: 1, price: 350 },
        { min: 1, max: 999999, price: 320 }
      ]
    },
    panjakent: {
      weightTiers: [
        { min: 0, max: 30, price: 5.0 },
        { min: 30, max: 80, price: 4.5 },
        { min: 80, max: 999999, price: 4.0 }
      ],
      volumeTiers: [
        { min: 0, max: 1, price: 400 },
        { min: 1, max: 999999, price: 380 }
      ]
    }
  };
}

export async function calculatePrice(value: number, type: 'weight' | 'volume', city: 'dushanbe' | 'panjakent' = 'dushanbe') {
  const config = await getPricingConfig();
  const cityConfig = config[city] || config.dushanbe;
  const tiers = type === 'weight' ? cityConfig.weightTiers : cityConfig.volumeTiers;
  
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
    .text("📍 Душанбе", "calc_city_dushanbe").row()
    .text("📍 Панҷакент", "calc_city_panjakent");

  await ctx.reply("Ба кадом шаҳр мехоҳед бор равон кунед?", { reply_markup: keyboard });
});

calculatorHandler.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;
  
  if (data === "calc_city_dushanbe" || data === "calc_city_panjakent") {
    const city = data === "calc_city_dushanbe" ? "dushanbe" : "panjakent";
    ctx.session.step = "calculator_type";
    ctx.session.calcCity = city;
    
    const keyboard = new InlineKeyboard()
      .text("⚖️ Вазн (Кг)", `calc_type_kg`).row()
      .text("📦 Ҳаҷм (М³)", `calc_type_m3`);
      
    await ctx.editMessageText(`Шумо шаҳри <b>${city === 'dushanbe' ? 'Душанбе' : 'Панҷакент'}</b>-ро интихоб кардед.\n\nАз рӯи чӣ ҳисоб мекунем?`, { parse_mode: "HTML", reply_markup: keyboard });
    await ctx.answerCallbackQuery();
  } else if (data === "calc_type_kg") {
    ctx.session.step = "calculator_kg";
    await ctx.editMessageText("⚖️ Лутфан вазни борро бо килограмм нависед (масалан: <code>15</code> ё <code>2.5</code>)", { parse_mode: "HTML" });
    await ctx.answerCallbackQuery();
  } else if (data === "calc_type_m3") {
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
    
    const city = ctx.session.calcCity || 'dushanbe';
    const result = await calculatePrice(weight, 'weight', city);
    const cityName = city === 'dushanbe' ? 'Душанбе' : 'Панҷакент';
    await ctx.reply(`📍 Шаҳр: <b>${cityName}</b>\n⚖️ Вазн: <b>${weight} кг</b>\n💵 Нарх барои 1 кг: <b>$${result.pricePerUnit}</b>\n💰 Нархи умумии интиқол: <b>$${result.total.toFixed(2)}</b>`, { parse_mode: "HTML" });
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
    
    const city = ctx.session.calcCity || 'dushanbe';
    const result = await calculatePrice(volume, 'volume', city);
    const cityName = city === 'dushanbe' ? 'Душанбе' : 'Панҷакент';
    await ctx.reply(`📍 Шаҳр: <b>${cityName}</b>\n📦 Ҳаҷм: <b>${volume.toFixed(3)} м³</b>\n💵 Нарх барои 1 м³: <b>$${result.pricePerUnit}</b>\n💰 Нархи умумии интиқол: <b>$${result.total.toFixed(2)}</b>`, { parse_mode: "HTML" });
    ctx.session.step = "";
  }
  else {
    await next();
  }
});
