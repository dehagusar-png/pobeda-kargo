import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Only SUPERADMIN can change roles" }, { status: 403 });
    }

    const { id } = await context.params;
    const { role, pin } = await request.json();
    const userId = parseInt(id);

    if (!role || !["USER", "ADMIN", "WORKER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ҳеҷ кас (ҳатто дигар SUPERADMIN) наметавонад вазифаи SUPERADMIN-и амалкунандаро паст кунад ё тағйир диҳад.
    if (existingUser.role === "SUPERADMIN") {
      return NextResponse.json({ error: "Шумо наметавонед вазифаи SUPERADMIN-ро тағйир диҳед ё худро аз вазифа гиред!" }, { status: 403 });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    const adminName = (session?.user as any)?.name || "Номаълум";
    await prisma.auditLog.create({
      data: {
        adminName,
        action: "Иваз кард (Вазифа)",
        target: `Корбар ${updatedUser.firstName} ${updatedUser.lastName || ''}`,
        details: `Вазифа аз ${existingUser.role} ба ${role} иваз шуд`
      }
    });

    return NextResponse.json({
      ...updatedUser,
      telegramId: updatedUser.telegramId.toString()
    });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
