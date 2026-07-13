import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    // Format users for the table
    const formattedUsers = users.map(u => ({
      id: u.id,
      clientCode: u.clientCode || "Номаълум",
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Мизоҷи Нав",
      phone: u.phone || "Номаълум",
      role: u.phone === "+992928153531" ? "SUPERADMIN" : u.role,
      language: u.language,
      date: u.createdAt.toISOString().split("T")[0]
    }));

    return NextResponse.json(formattedUsers);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
