import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
