import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// CORS headers are needed because scanner app runs on Telegram Webview which might have a different origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const statusMapLocal: any = {
  "EXPECTED": { tg: "Мунтазир", ru: "Ожидается", uz: "Kutilmoqda" },
  "IN_CHINA": { tg: "Дар Чин", ru: "В Китае", uz: "Xitoyda" },
  "IN_TRANSIT": { tg: "Дар роҳ", ru: "В пути", uz: "Yo'lda" },
  "ARRIVED": { tg: "Дар Тоҷикистон", ru: "В Таджикистане", uz: "Tojikistonda" },
  "DELIVERED": { tg: "Супорида шуд", ru: "Доставлено", uz: "Yetkazildi" },
};

import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { trackCode, telegramId, initData } = await request.json();
    
    if (!trackCode || !telegramId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400, headers: corsHeaders });
    }

    // Амнияти сканер: тафтиши initData
    if (initData) {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      urlParams.delete('hash');
      
      // Sort keys alphabetically
      const keys = Array.from(urlParams.keys()).sort();
      let dataCheckString = '';
      for (const key of keys) {
        dataCheckString += `${key}=${urlParams.get(key)}\n`;
      }
      dataCheckString = dataCheckString.slice(0, -1);
      
      const botToken = process.env.BOT_TOKEN;
      if (botToken) {
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        
        if (calculatedHash !== hash) {
          return NextResponse.json({ error: "Ҳуҷҷатҳои қалбакӣ! (Invalid initData)" }, { status: 403, headers: corsHeaders });
        }
      }
    } else {
      // Агар initData набошад, метавонем манъ кунем. Вале ҳозир иҷозат медиҳем, ки аз дохили браузери оддӣ кор кунад, агар лозим бошад. 
      // Барои амнияти пурра: 
      console.warn("Scanner API: initData is missing, relying on telegramId check only.");
    }

    const worker = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!worker || (worker.role !== "ADMIN" && worker.role !== "WORKER" && worker.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: `Шумо ҳуқуқи скан кардан надоред (ID: ${telegramId})` }, { status: 403, headers: corsHeaders });
    }

    const parcel = await prisma.parcel.findUnique({
      where: { trackCode }
    });

    let nextStatus = "IN_CHINA";
    let message = "";
    let savedParcelId = 0;

    if (parcel) {
      if (parcel.status === "DELIVERED") {
        return NextResponse.json({ 
          success: true, 
          message: `Бор аллакай супорида шудааст!`, 
          status: parcel.status 
        }, { headers: corsHeaders });
      }
      
      if (parcel.status === "ARRIVED") {
        return NextResponse.json({ 
          success: true, 
          message: `Бор аллакай дар анбори Тоҷикистон аст! Барои гирифтани бор ба администратор муроҷиат кунед.`, 
          status: parcel.status 
        }, { headers: corsHeaders });
      }

      if (parcel.status === "EXPECTED") nextStatus = "IN_CHINA";
      else if (parcel.status === "IN_CHINA" || parcel.status === "IN_TRANSIT") nextStatus = "ARRIVED";

      const updated = await prisma.parcel.update({
        where: { id: parcel.id },
        data: { status: nextStatus as any }
      });
      savedParcelId = updated.id;
      message = `Статус иваз шуд: ${statusMapLocal[nextStatus]?.tg || nextStatus}`;

      // Notify owner
      if (parcel.userId) {
        const owner = await prisma.user.findUnique({ where: { id: parcel.userId } });
        if (owner && owner.telegramId) {
          const botToken = process.env.BOT_TOKEN;
          if (botToken) {
            const lang = owner.language || "tg";
            const statusLoc = statusMapLocal[nextStatus]?.[lang] || nextStatus;
            
            let text = `📦 Статуси бори шумо (${trackCode}) иваз шуд: <b>${statusLoc}</b>`;
            if (lang === "ru") text = `📦 Статус вашей посылки (${trackCode}) изменен: <b>${statusLoc}</b>`;
            else if (lang === "uz") text = `📦 Sizning yukingiz holati (${trackCode}) o'zgardi: <b>${statusLoc}</b>`;
            
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                chat_id: owner.telegramId.toString(), 
                text: text,
                parse_mode: "HTML"
              })
            }).catch(console.error);
          }
        }
      }
    } else {
      const newParcel = await prisma.parcel.create({
        data: {
          trackCode,
          status: "IN_CHINA"
        }
      });
      savedParcelId = newParcel.id;
      message = "Бори нав сабт шуд (Дар Чин)";
    }

    // Сабт дар ParcelHistory
    if (savedParcelId > 0) {
      await prisma.parcelHistory.create({
        data: {
          parcelId: savedParcelId,
          status: nextStatus as any
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        adminName: worker.firstName || worker.telegramId.toString(),
        action: parcel ? "Скан кард (Ивази ҳолат)" : "Скан кард (Бори нав)",
        target: `Трек-код: ${trackCode}`,
        details: message
      }
    });

    return NextResponse.json({ success: true, message, trackCode, status: nextStatus }, { headers: corsHeaders });
  } catch (error) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ error: "Хатогӣ дар сервер" }, { status: 500, headers: corsHeaders });
  }
}
