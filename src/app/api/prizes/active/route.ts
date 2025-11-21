import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const prizes = await prisma.prize.findMany({
      where: {
        isEnabled: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(prizes);
  } catch (error) {
    console.error('Failed to fetch active prizes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prizes' },
      { status: 500 }
    );
  }
}