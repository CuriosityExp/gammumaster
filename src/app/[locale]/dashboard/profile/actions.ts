'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateProfile(data: {
  name: string;
  email?: string;
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'user') {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }

    if (data.name.length > 100) {
      return { success: false, error: 'Name must not exceed 100 characters' };
    }

    // Validate email if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return { success: false, error: 'Invalid email format' };
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.userId !== session.user.id) {
        return { success: false, error: 'Email is already taken' };
      }
    }

    // Update user
    await prisma.user.update({
      where: { userId: session.user.id },
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
      },
    });

    revalidatePath('/dashboard/profile');
    
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        points: true,
        qrCodeIdentifier: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
