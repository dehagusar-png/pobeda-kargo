import { Composer, InlineKeyboard } from "grammy";
import { MyContext, i18n } from "../bot";
import { prisma } from "../db";
import { BUTTONS } from "../utils/constants";

export const trackHandler = new Composer<MyContext>();

trackHandler.hears(BUTTONS.TRACK, async (ctx) => {
  ctx.session.step = "track";
  await ctx.reply("Лутфан трек-коди худро фиристед: / Пожалуйста, отправьте ваш трек-код:");
});

trackHandler.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "track") {
    const trackCode = ctx.message.text.trim();
    const parcel = await prisma.parcel.findUnique({ where: { trackCode } });
    
    if (parcel) {
      if (!parcel.userId) {
        ctx.session.tempTrackCode = trackCode;
        ctx.session.step = "claim_verification";
        
        const inlineKeyboard = new InlineKeyboard()
          .text(ctx.t("btn_mine"), `claim_${trackCode}`).row()
          .text(ctx.t("btn_others"), `assign_other_${trackCode}`).row()
          .text(ctx.t("btn_track_only"), `track_only_${trackCode}`);
          
        await ctx.reply(ctx.t("claim_prompt"), { reply_markup: inlineKeyboard });
      } else {
        const statusText = ctx.t("status_" + parcel.status);
        const inlineKeyboard = new InlineKeyboard().webApp(
          "📍 Дар харита дидан",
          `https://pobeda-admin-panel.onrender.com/track/${trackCode}`
        );
        await ctx.reply(`📦 Бор: ${trackCode}\nҲолат: <b>${statusText}</b>`, { 
          parse_mode: "HTML",
          reply_markup: inlineKeyboard
        });
      }
    } else {
      await ctx.reply("❌ Бор бо ин трек-код ёфт нашуд.");
    }
    
    if (ctx.session.step === "track") {
      ctx.session.step = ""; // clear step if not transitioned
    }
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
      const user = ctx.user;
      
      // Танҳо Admin ё Worker ҳуқуқи иваз кардани статусро доранд
      if (user?.role === "ADMIN" || user?.role === "WORKER") {
        const parcel = await prisma.parcel.findUnique({ where: { trackCode: data.trackCode } });
        
        if (parcel) {
           if (parcel.status === "DELIVERED") {
             await ctx.reply(`ℹ️ Бор (${data.trackCode}) аллакай ба мизоҷ дода шудааст (${ctx.t("status_DELIVERED")}).`);
             return;
           }

           let nextStatus = "IN_CHINA";
           if (parcel.status === "EXPECTED") nextStatus = "IN_CHINA";
           else if (parcel.status === "IN_CHINA") nextStatus = "IN_TRANSIT";
           else if (parcel.status === "IN_TRANSIT") nextStatus = "ARRIVED";
           else if (parcel.status === "ARRIVED") nextStatus = "DELIVERED";
           
           await prisma.parcel.update({
             where: { id: parcel.id },
             data: { status: nextStatus as any }
           });
           
           await ctx.reply(`✅ Статуси бор ${data.trackCode} ба ${ctx.t("status_" + nextStatus)} иваз карда шуд.`);
           
           // Огоҳинома (Push Notification) ба соҳиби бор
           if (parcel.userId) {
             const owner = await prisma.user.findUnique({ where: { id: parcel.userId } });
             if (owner && owner.telegramId) {
               const ownerLang = owner.language || "tg";
               const localizedStatus = i18n.t(ownerLang, "status_" + nextStatus);
               const msg = i18n.t(ownerLang, "status_changed", { trackCode: data.trackCode, status: localizedStatus });
               await ctx.api.sendMessage(Number(owner.telegramId), msg, { parse_mode: "HTML" });
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
           await ctx.reply(`🆕 Бори нав (${data.trackCode}) ба база илова шуд (${ctx.t("status_IN_CHINA")}).`);
        }
      } else {
        await ctx.reply("❌ Шумо ҳуқуқи тағйир додани статусро надоред.");
      }
    }
  } catch (e) {
    console.error(e);
  }
});
