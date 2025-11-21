import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user') {
      return NextResponse.json(
        { count: 0 },
        { status: 200 }
      );
    }

    // Find user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ count: 0 });
    }

    // Calculate total items in cart
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({ count: totalItems });

  } catch (error) {
    console.error('Failed to get cart count:', error);
    return NextResponse.json(
      { count: 0 },
      { status: 500 }
    );
  }
}