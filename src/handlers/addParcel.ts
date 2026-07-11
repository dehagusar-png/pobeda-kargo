import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";
import { BUTTONS, STATUS_MAP } from "../utils/constants";

export const addParcelHandler = new Composer<MyContext>();

addParcelHandler.hears(BUTTONS.ADD_PARCEL, async (ctx) => {
  ctx.session.step = "add_parcel";
  await ctx.reply(ctx.t("add_parcel_prompt"));
});

addParcelHandler.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "add_parcel") {
    const trackCode = ctx.message.text.trim();
    
    // Check if parcel already exists
    const existingParcel = await prisma.parcel.findUnique({ where: { trackCode } });
    
    if (existingParcel) {
      if (existingParcel.userId) {
        if (existingParcel.userId === ctx.user?.id) {
          await ctx.reply(ctx.t("parcel_already_yours"));
        } else {
          await ctx.reply(ctx.t("parcel_already_others"));
        }
      } else {
        // Parcel exists but has no owner (e.g. scanned in China but not claimed)
        ctx.session.tempTrackCode = trackCode;
        ctx.session.step = "claim_verification";
        
        const inlineKeyboard = new InlineKeyboard()
          .text(ctx.t("btn_mine"), `claim_${trackCode}`).row()
          .text(ctx.t("btn_others"), `assign_other_${trackCode}`).row()
          .text(ctx.t("btn_track_only"), `track_only_${trackCode}`);
          
        await ctx.reply(ctx.t("claim_prompt"), { reply_markup: inlineKeyboard });
      }
    } else {
      // Create new expected parcel
      await prisma.parcel.create({
        data: {
          trackCode,
          status: "EXPECTED",
          userId: ctx.user?.id || null
        }
      });
      await ctx.reply(ctx.t("parcel_added", { trackCode }));
    }
    
    if (ctx.session.step === "add_parcel") {
      ctx.session.step = ""; // Clear step if not transitioned to claim_verification
    }
  } else if (ctx.session.step === "wait_owner_code") {
    const clientCode = ctx.message.text.trim().toUpperCase();
    const trackCode = ctx.session.tempTrackCode;
    
    if (!trackCode) {
      ctx.session.step = "";
      return;
    }
    
    // Find the owner user
    const owner = await prisma.user.findUnique({ where: { clientCode } });
    
    if (!owner) {
      await ctx.reply(ctx.t("owner_not_found"));
      ctx.session.step = "";
      return;
    }
    
    // Assign parcel
    await prisma.parcel.update({
      where: { trackCode },
      data: { userId: owner.id }
    });
    
    await ctx.reply(ctx.t("parcel_assigned", { clientCode }));
    
    // Optionally notify the owner
    if (owner.telegramId) {
      try {
        await ctx.api.sendMessage(
          Number(owner.telegramId), 
          `🔔 Огоҳинома: Бори шумо (${trackCode}) аз тарафи каси дигар ба номи шумо ба қайд гирифта шуд ва ҳоло дар Чин аст.`
        );
      } catch (e) {
        console.error("Could not notify owner:", e);
      }
    }
    
    ctx.session.step = "";
    ctx.session.tempTrackCode = "";
  } else {
    await next();
  }
});

addParcelHandler.callbackQuery(/^claim_(.+)$/, async (ctx) => {
  const trackCode = ctx.match[1] as string;
  
  await prisma.parcel.update({
    where: { trackCode },
    data: { userId: ctx.user?.id || null }
  });
  
  await ctx.editMessageText(ctx.t("parcel_added", { trackCode: trackCode || "" }));
  await ctx.answerCallbackQuery();
});

addParcelHandler.callbackQuery(/^assign_other_(.+)$/, async (ctx) => {
  const trackCode = ctx.match[1] as string;
  ctx.session.step = "wait_owner_code";
  ctx.session.tempTrackCode = trackCode;
  
  await ctx.editMessageText(ctx.t("ask_owner_code"));
  await ctx.answerCallbackQuery();
});

addParcelHandler.callbackQuery(/^track_only_(.+)$/, async (ctx) => {
  const trackCode = ctx.match[1] as string;
  const parcel = await prisma.parcel.findUnique({ where: { trackCode } });
  
  if (parcel) {
    const statusText = STATUS_MAP[parcel.status] || parcel.status;
    await ctx.editMessageText(`📦 Бор: ${trackCode}\nҲолат: <b>${statusText}</b>`, { parse_mode: "HTML" });
  }
  
  await ctx.answerCallbackQuery();
});
