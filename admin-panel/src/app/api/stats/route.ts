import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalParcels = await prisma.parcel.count();
    const totalUsers = await prisma.user.count();
    const inTransit = await prisma.parcel.count({ where: { status: "IN_TRANSIT" } });
    const expected = await prisma.parcel.count({ where: { status: "EXPECTED" } });

    // Approximate revenue calculation based on delivered parcels (mocking for now if price is missing)
    const deliveredParcels = await prisma.parcel.findMany({ where: { status: "DELIVERED" } });
    const revenue = deliveredParcels.reduce((acc, curr) => acc + (curr.price || 0), 0);

    const chartData = [];
    const today = new Date();
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

    return NextResponse.json({ 
      totalParcels, 
      totalUsers, 
      inTransit, 
      expected,
      revenue,
      chartData
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
