import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Default pricing config fallback
const defaultConfig = {
  dushanbe: { weightTiers: [], volumeTiers: [] },
  panjakent: { weightTiers: [], volumeTiers: [] }
};

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst({
      where: { id: 1 }
    });
    
    if (settings && settings.pricingData) {
      return NextResponse.json(settings.pricingData);
    }
    
    return NextResponse.json(defaultConfig);
  } catch (_error) {
    return NextResponse.json(defaultConfig);
  }
}

export async function POST(_request: Request) {
  try {
    const body = await _request.json();
    const { pin, config } = body;
    
    const correctPin = process.env.SUPERADMIN_PIN || "7777";
    if (pin !== correctPin) {
      return NextResponse.json({ error: "PIN_REQUIRED" }, { status: 403 });
    }
    
    await prisma.settings.upsert({
      where: { id: 1 },
      update: { pricingData: config },
      create: { id: 1, pricingData: config }
    });
    
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
