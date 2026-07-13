import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];`);
    return NextResponse.json({ success: true, message: 'Migration applied!' });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
