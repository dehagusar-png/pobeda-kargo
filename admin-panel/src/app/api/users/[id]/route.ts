import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const callerIdStr = (session?.user as any)?.id;
    if (!callerIdStr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const callerId = parseInt(callerIdStr);
    const callerUser = await prisma.user.findUnique({ where: { id: callerId } });

    if (!callerUser || (callerUser.role !== "SUPERADMIN" && callerUser.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only ADMIN or SUPERADMIN can change roles" }, { status: 403 });
    }

    const { id } = await context.params;
    const { role } = await request.json();
    const userId = parseInt(id);

    if (!role || !["USER", "ADMIN", "WORKER", "SUPERADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ownerTgId = "6554193925"; // ID-и Spn2211 (Шумо)
    const isTargetOwner = existingUser.telegramId.toString() === ownerTgId;
    const isCallerOwner = callerUser.telegramId.toString() === ownerTgId;

    // Қоидаи 1: Ҳеҷ кас Роҳбари асосиро тағйир дода наметавонад
    if (isTargetOwner) {
      return NextResponse.json({ error: "Роҳбари асосиро аз вазифа гирифтан ё тағйир додан мумкин нест!" }, { status: 403 });
    }

    if (callerUser.role === "ADMIN") {
      // Қоидаи 2: Админ наметавонад Админи дигар ё Суперадминро аз вазифа гирад
      if (existingUser.role === "ADMIN" || existingUser.role === "SUPERADMIN") {
        return NextResponse.json({ error: "Админ наметавонад вазифаи Админ ё Суперадминро иваз кунад!" }, { status: 403 });
      }
      // Админ наметавонад касеро Админ ё Суперадмин таъин кунад
      if (role === "ADMIN" || role === "SUPERADMIN") {
        return NextResponse.json({ error: "Админ наметавонад касеро Админ ё Суперадмин таъин кунад!" }, { status: 403 });
      }
    } else if (callerUser.role === "SUPERADMIN") {
      // Қоидаи 3: Агар Суперадмин Роҳбари асосӣ (Шумо) набошад, наметавонад дигар Суперадминро иваз кунад
      if (!isCallerOwner && existingUser.role === "SUPERADMIN") {
        return NextResponse.json({ error: "Шумо наметавонед вазифаи дигар Суперадминро иваз кунед!" }, { status: 403 });
      }
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
