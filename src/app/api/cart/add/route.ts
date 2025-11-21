import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prizeId, quantity = 1 } = await request.json();

    if (!prizeId) {
      return NextResponse.json(
        { error: 'Prize ID is required' },
        { status: 400 }
      );
    }

    // Check if prize exists and is available
    const prize = await prisma.prize.findUnique({
      where: { prizeId },
    });

    if (!prize || !prize.isEnabled || prize.deletedAt) {
      return NextResponse.json(
        { error: 'Prize not available' },
        { status: 404 }
      );
    }

    if (prize.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Find or create user's cart
    let cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Check if prize is already in cart
    const existingCartItem = await prisma.userCart.findUnique({
      where: {
        cartId_prizeId: {
          cartId: cart.id,
          prizeId: prizeId,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > prize.stock) {
        return NextResponse.json(
          { error: 'Cannot add more items than available stock' },
          { status: 400 }
        );
      }

      await prisma.userCart.update({
        where: {
          cartId_prizeId: {
            cartId: cart.id,
            prizeId: prizeId,
          },
        },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      await prisma.userCart.create({
        data: {
          cartId: cart.id,
          prizeId: prizeId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully'
    });

  } catch (error) {
    console.error('Failed to add item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}