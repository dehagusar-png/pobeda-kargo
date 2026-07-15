import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const parcels = await prisma.parcel.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        user: {
          select: { clientCode: true, firstName: true }
        }
      }
    });
    
    // Format parcels for the table
    const formattedParcels = parcels.map(p => ({
      id: p.id,
      track: p.trackCode,
      client: p.user?.clientCode || "Номаълум",
      status: p.status,
      weight: p.weight ? `${p.weight} kg` : "-",
      date: p.createdAt.toISOString().split("T")[0]
    }));

    return NextResponse.json(formattedParcels);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch parcels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trackCode, clientCode } = body;

    if (!trackCode || !clientCode) {
      return NextResponse.json({ error: "Лутфан Трек-код ва Client ID-ро ворид кунед" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clientCode }
    });

    if (!user) {
      return NextResponse.json({ error: "Мизоҷ бо ин Client ID ёфт нашуд" }, { status: 404 });
    }

    // Check if parcel already exists
    const existingParcel = await prisma.parcel.findUnique({
      where: { trackCode }
    });

    if (existingParcel) {
      return NextResponse.json({ error: "Ин трек-код аллакай дар система вуҷуд дорад" }, { status: 400 });
    }

    const parcel = await prisma.parcel.create({
      data: {
        trackCode,
        userId: user.id,
        status: "EXPECTED"
      }
    });

    // Send Telegram Notification
    const botToken = process.env.BOT_TOKEN;
    if (botToken && user.telegramId) {
      let text = `📦 Бор бо трек-коди ${trackCode} дар система ба қайд гирифта шуд ва мо онро интизорем!`;
      
      if (user.language === "ru") {
        text = `📦 Посылка с трек-кодом ${trackCode} зарегистрирована в системе, и мы её ожидаем!`;
      } else if (user.language === "uz") {
        text = `📦 ${trackCode} trek-kodli yuk tizimda ro'yxatga olindi va biz uni kutyapmiz!`;
      } else if (user.language === "zh") {
        text = `📦 运单号为 ${trackCode} 的包裹已在系统中登记，我们正在等待它的到来！`;
      }

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: user.telegramId.toString(),
          text: text
        })
      });
    }

    // Audit Log
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || "Номаълум";
    await prisma.auditLog.create({
      data: {
        adminName,
        action: "Илова кард (Бор)",
        target: `Трек-код: ${trackCode}`,
        details: `Бори нав ба мизоҷи ${clientCode} илова шуд`
      }
    });

    return NextResponse.json({ success: true, parcel });
  } catch (error) {
    console.error("Error creating parcel:", error);
    return NextResponse.json({ error: "Хатогӣ ҳангоми сабти бор" }, { status: 500 });
  }
}
