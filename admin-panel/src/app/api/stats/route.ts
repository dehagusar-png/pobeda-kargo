import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const totalParcels = await prisma.parcel.count();
    const totalUsers = await prisma.user.count();
    const inTransit = await prisma.parcel.count({ where: { status: "IN_TRANSIT" } });
    const expected = await prisma.parcel.count({ where: { status: "EXPECTED" } });

    // Approximate revenue calculation based on delivered parcels (mocking for now if price is missing)
    const deliveredParcels = await prisma.parcel.findMany({ where: { status: "DELIVERED" } });
    const revenue = deliveredParcels.reduce((acc, curr) => acc + (curr.price || 0), 0);

    return NextResponse.json({ 
      totalParcels, 
      totalUsers, 
      inTransit, 
      expected,
      revenue 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
