import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { role, pin } = await request.json();
    const userId = parseInt(id);

    if (!role || !["USER", "ADMIN", "WORKER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Protect SUPERADMIN from being changed
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    if (existingUser.role === "SUPERADMIN") {
      return NextResponse.json({ error: "Cannot change role of a SUPERADMIN" }, { status: 403 });
    }

    // Require PIN for Murodov_QS
    if (existingUser.phone === "79801868277") {
      const correctPin = process.env.SUPERADMIN_PIN || "7777";
      if (pin !== correctPin) {
        return NextResponse.json({ error: "PIN_REQUIRED" }, { status: 403 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({
      ...updatedUser,
      telegramId: updatedUser.telegramId.toString()
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
