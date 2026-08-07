import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const parcelId = parseInt(resolvedParams.id);
    if (isNaN(parcelId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const parcel = await prisma.parcel.findUnique({ where: { id: parcelId } });
    if (!parcel) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.parcel.delete({ where: { id: parcelId } });

    // Audit Log
    const adminName = session?.user?.name || "Номаълум";
    await prisma.auditLog.create({
      data: {
        adminName,
        action: "Нест кард (Бор)",
        target: `Трек-код: ${parcel.trackCode}`,
        details: `Бори ${parcel.trackCode} нест карда шуд`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting parcel:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const parcelId = parseInt(resolvedParams.id);
    if (isNaN(parcelId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { trackCode, weight, status } = body;

    const dataToUpdate: any = {};
    if (trackCode) dataToUpdate.trackCode = trackCode;
    if (weight !== undefined) {
      const parsedWeight = parseFloat(weight);
      dataToUpdate.weight = isNaN(parsedWeight) ? null : parsedWeight;
    }
    if (status) dataToUpdate.status = status;

    const updatedParcel = await prisma.parcel.update({
      where: { id: parcelId },
      data: dataToUpdate
    });

    // Audit Log
    const adminName = session?.user?.name || "Номаълум";
    await prisma.auditLog.create({
      data: {
        adminName,
        action: "Таҳрир кард (Бор)",
        target: `Трек-код: ${updatedParcel.trackCode}`,
        details: `Маълумоти бор навсозӣ шуд`
      }
    });

    return NextResponse.json({ success: true, parcel: updatedParcel });
  } catch (error) {
    console.error("Error updating parcel:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
