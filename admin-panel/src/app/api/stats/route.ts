import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalParcels = await prisma.parcel.count();
    const totalUsers = await prisma.user.count();
    const inTransit = await prisma.parcel.count({ where: { status: "IN_TRANSIT" } });
    const expected = await prisma.parcel.count({ where: { status: "EXPECTED" } });

    // Calculate trends (Last 7 days vs Previous 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const getTrend = async (model: any, condition: any = {}) => {
      const thisWeek = await model.count({ where: { ...condition, createdAt: { gte: sevenDaysAgo } } });
      const lastWeek = await model.count({ where: { ...condition, createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });
      if (lastWeek === 0) return thisWeek > 0 ? "+100%" : "0%";
      const diff = ((thisWeek - lastWeek) / lastWeek) * 100;
      return diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
    };

    const trends = {
      parcels: await getTrend(prisma.parcel),
      users: await getTrend(prisma.user),
      expected: await getTrend(prisma.parcel, { status: "EXPECTED" }),
      inTransit: await getTrend(prisma.parcel, { status: "IN_TRANSIT" })
    };

    // Chart data
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      
      const count = await prisma.parcel.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      const dayName = d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
      chartData.push({ name: dayName, parcels: count });
    }

    // Recent activity (Last 5 updated parcels)
    const recentActivityRaw = await prisma.parcel.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { trackCode: true, status: true, updatedAt: true }
    });

    const statusMap: Record<string, string> = {
      "EXPECTED": "мунтазири қабул аст",
      "IN_CHINA": "ба анбори Чин расид",
      "IN_TRANSIT": "дар роҳ аст",
      "ARRIVED": "ба Душанбе расид",
      "DELIVERED": "ба муштарӣ супорида шуд"
    };

    const recentActivity = recentActivityRaw.map(p => ({
      trackCode: p.trackCode,
      message: `Бор ${p.trackCode} ${statusMap[p.status] || p.status}`,
      time: p.updatedAt
    }));

    return NextResponse.json({ 
      totalParcels, 
      totalUsers, 
      inTransit, 
      expected,
      trends,
      chartData,
      recentActivity
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
