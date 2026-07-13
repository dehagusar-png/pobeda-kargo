import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });

    let settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: 1, exchangeRate: 1.50 } });
    }

    return NextResponse.json({
      products,
      exchangeRate: settings.exchangeRate
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
