import { Composer } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";

export const trackHandler = new Composer<MyContext>();

trackHandler.hears([
  "🔍 Пайгирии Бор", "🔍 Отслеживание груза", "🔍 Yukni kuzatish", "🔍 追踪货物"
], async (ctx) => {
  ctx.session.step = "track";
  await ctx.reply("Лутфан трек-коди худро фиристед: / Пожалуйста, отправьте ваш трек-код:");
});

trackHandler.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "track") {
    const trackCode = ctx.message.text.trim();
    const parcel = await prisma.parcel.findUnique({ where: { trackCode } });
    
    if (parcel) {
      const statusMap: Record<string, string> = {
        "EXPECTED": "Мунтазири қабул 📦",
        "IN_CHINA": "Дар анбори Чин 🇨🇳",
        "IN_TRANSIT": "Дар роҳ ба Тоҷикистон 🚚",
        "ARRIVED": "Дар Тоҷикистон омода аст 🇹🇯",
        "DELIVERED": "Супорида шуд ✅"
      };
      
      const statusText = statusMap[parcel.status] || parcel.status;
      await ctx.reply(`📦 Бор: ${trackCode}\nҲолат: <b>${statusText}</b>`, { parse_mode: "HTML" });
    } else {
      await ctx.reply("❌ Бор бо ин трек-код ёфт нашуд.");
    }
    ctx.session.step = ""; // clear step
  } else {
    await next();
  }
});

// Қабули маълумот аз сканери Mini App
trackHandler.on("message:web_app_data", async (ctx) => {
  try {
    if (!ctx.from) return;
    const data = JSON.parse(ctx.message.web_app_data.data);
    if (data.trackCode) {
      const user = await prisma.user.findUnique({ where: { telegramId: ctx.from.id } });
      
      // Танҳо Admin ё Worker ҳуқуқи иваз кардани статусро доранд
      if (user?.role === "ADMIN" || user?.role === "WORKER") {
        const parcel = await prisma.parcel.findUnique({ where: { trackCode: data.trackCode } });
        
        if (parcel) {
           let nextStatus = "IN_CHINA";
           if (parcel.status === "EXPECTED") nextStatus = "IN_CHINA";
           else if (parcel.status === "IN_CHINA") nextStatus = "IN_TRANSIT";
           else if (parcel.status === "IN_TRANSIT") nextStatus = "ARRIVED";
           else if (parcel.status === "ARRIVED") nextStatus = "DELIVERED";
           
           await prisma.parcel.update({
             where: { id: parcel.id },
             data: { status: nextStatus as any }
           });
           
           await ctx.reply(`✅ Статуси бор ${data.trackCode} ба ${nextStatus} иваз карда шуд.`);
           
           // Огоҳинома (Push Notification) ба соҳиби бор
           if (parcel.userId) {
             const owner = await prisma.user.findUnique({ where: { id: parcel.userId } });
             if (owner && owner.telegramId) {
               await ctx.api.sendMessage(Number(owner.telegramId), `🔔 Огоҳинома: Статуси бори шумо (${data.trackCode}) иваз шуд: <b>${nextStatus}</b>`, { parse_mode: "HTML" });
             }
           }
        } else {
           // Агар бор дар база набошад, коргар онро аз нав илова мекунад
           await prisma.parcel.create({
             data: {
               trackCode: data.trackCode,
               status: "IN_CHINA"
             }
           });
           await ctx.reply(`🆕 Бори нав (${data.trackCode}) ба база илова шуд (IN_CHINA).`);
        }
      } else {
        await ctx.reply("❌ Шумо ҳуқуқи тағйир додани статусро надоред.");
      }
    }
  } catch (e) {
    console.error(e);
  }
});
