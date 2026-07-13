import { Composer, InlineKeyboard } from "grammy";
import { MyContext } from "../bot";
import { prisma } from "../db";
import { BUTTONS } from "../utils/constants";

export const marketplaceHandler = new Composer<MyContext>();

marketplaceHandler.hears([/Харид аз Чин/i, /Покупки из Китая/i, /Xitoydan xaridlar/i, /中国购物/i, /Shop from China/i], async (ctx) => {
  await showProduct(ctx, 0);
});

async function showProduct(ctx: MyContext, index: number, messageIdToEdit?: number) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  if (products.length === 0) {
    const msg = "Узр, айни ҳол дар мағоза мол нест. / Извините, сейчас в магазине нет товаров.";
    if (messageIdToEdit && ctx.chat) {
       return ctx.api.editMessageText(ctx.chat.id, messageIdToEdit, msg).catch(() => {});
    }
    return ctx.reply(msg);
  }

  // Handle bounds
  if (index < 0) index = products.length - 1;
  if (index >= products.length) index = 0;

  const product = products[index];
  if (!product) return;
  
  // Get settings for exchange rate
  let settings = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: 1, exchangeRate: 1.50 } });
  }
  const rate = settings.exchangeRate;
  const priceTJS = (product.priceCNY * rate).toFixed(2);

  const text = `🛍 <b>${product.title}</b>\n\n` +
               `${product.description ? `${product.description}\n\n` : ''}` +
               `💰 Нарх: <b>${priceTJS} Сомонӣ</b> 🇹🇯 (~${product.priceCNY} ¥)\n\n` +
               `<i>Маҳсулоти ${index + 1} аз ${products.length}</i>`;

  const keyboard = new InlineKeyboard()
    .text("⬅️ Қаблӣ", `cat_${index - 1}`)
    .text("Фармоиш додан 🛒", `buy_${product.id}`)
    .text("Баъдӣ ➡️", `cat_${index + 1}`);

  if (messageIdToEdit && ctx.chat) {
    if (product.image) {
      // Note: Changing from text to photo might fail if the original message was text. 
      // It's safer to always reply with a new message if switching media types.
      // But we will assume the previous was also a photo if image exists.
      try {
        await ctx.api.editMessageMedia(ctx.chat.id, messageIdToEdit, {
           type: "photo",
           media: product.image,
           caption: text,
           parse_mode: "HTML"
        }, { reply_markup: keyboard });
      } catch (e) {
        // Fallback to sending a new message and deleting old
        await ctx.api.deleteMessage(ctx.chat.id, messageIdToEdit).catch(() => {});
        await ctx.replyWithPhoto(product.image, { caption: text, reply_markup: keyboard, parse_mode: "HTML" });
      }
    } else {
      try {
        await ctx.api.editMessageText(ctx.chat.id, messageIdToEdit, text, {
          reply_markup: keyboard,
          parse_mode: "HTML"
        });
      } catch (e) {
        // Fallback to sending a new message
        await ctx.api.deleteMessage(ctx.chat.id, messageIdToEdit).catch(() => {});
        await ctx.reply(text, { reply_markup: keyboard, parse_mode: "HTML" });
      }
    }
  } else {
    if (product.image) {
      await ctx.replyWithPhoto(product.image, { caption: text, reply_markup: keyboard, parse_mode: "HTML" });
    } else {
      await ctx.reply(text, { reply_markup: keyboard, parse_mode: "HTML" });
    }
  }
}

marketplaceHandler.callbackQuery(/^cat_(-?\d+)$/, async (ctx) => {
  if (!ctx.match) return;
  const index = parseInt(ctx.match[1] as string, 10);
  await ctx.answerCallbackQuery();
  await showProduct(ctx, index, ctx.msg?.message_id);
});

marketplaceHandler.callbackQuery(/^buy_(\d+)$/, async (ctx) => {
  if (!ctx.match) return;
  const productId = parseInt(ctx.match[1] as string, 10);
  
  if (!ctx.from) return;
  const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from.id) } });
  
  if (!user) {
    return ctx.answerCallbackQuery({ text: "Аввал сабти ном шавед / Сначала зарегистрируйтесь", show_alert: true });
  }

  // Answer immediately to stop the button loading spinner and prevent Telegram timeout
  await ctx.answerCallbackQuery().catch(() => {});

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return ctx.reply("❌ Мол ёфт нашуд / Товар не найден");

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  const rate = settings?.exchangeRate || 1.5;
  const priceTJS = product.priceCNY * rate;

  try {
    await prisma.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        totalTJS: priceTJS,
        status: "PENDING"
      }
    });

    const successMsg = `✅ <b>Фармоиши шумо бомуваффақият сабт шуд!</b>\n\n` + 
                       `📦 <b>Мол:</b> ${product.title}\n` + 
                       `💰 <b>Нарх:</b> ${priceTJS.toFixed(2)} Сомонӣ\n\n` + 
                       `Менеҷерҳои мо ба зудӣ барои тасдиқи фармоиш бо шумо тамос мегиранд. Ташаккур барои интихобатон!`;
                       
    await ctx.reply(successMsg, { parse_mode: "HTML" });

  } catch (error) {
    console.error(error);
    await ctx.reply("❌ Хатогӣ ба вуҷуд омад. Лутфан дертар боз кӯшиш кунед.");
  }
});
