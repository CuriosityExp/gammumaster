// src/app/admin/facilitators/actions.ts

"use server";

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

const CreateFacilitatorSchema = z.object({
  userId: z.string().min(1, "User is required"),
  availablePointsToGrant: z.coerce.number().int().min(0, "Points must be a positive number"),
});

const UpdateFacilitatorSchema = z.object({
  availablePointsToGrant: z.coerce.number().int().min(0, "Points must be a positive number"),
});

export async function createFacilitator(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized: Only admins can create facilitators." };
  }

  const validatedFields = CreateFacilitatorSchema.safeParse({
    userId: formData.get("userId"),
    availablePointsToGrant: formData.get("availablePointsToGrant"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { userId, availablePointsToGrant } = validatedFields.data;

  try {
    // Check if user exists and is not already a facilitator
    const user = await prisma.user.findUnique({
      where: { userId },
      include: { facilitator: true },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.facilitator) {
      return { success: false, message: "This user is already a facilitator." };
    }

    const newFacilitator = await prisma.userFacilitator.create({
      data: {
        userId,
        availablePointsToGrant,
      },
    });

    revalidatePath("/admin/facilitators");
    return { success: true, message: `Facilitator created successfully for ${user.name}.`, facilitator: newFacilitator };
  } catch (error) {
    console.error("Create facilitator error:", error);
    return { success: false, message: "Failed to create facilitator." };
  }
}

export async function updateFacilitator(facilitatorId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized: Only admins can update facilitators." };
  }

  const validatedFields = UpdateFacilitatorSchema.safeParse({
    availablePointsToGrant: formData.get("availablePointsToGrant"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { availablePointsToGrant } = validatedFields.data;

  try {
    const updatedFacilitator = await prisma.userFacilitator.update({
      where: { facilitatorId },
      data: { availablePointsToGrant },
      include: { user: true },
    });

    revalidatePath("/admin/facilitators");
    return { success: true, message: `Facilitator "${updatedFacilitator.user.name}" updated successfully.` };
  } catch (error) {
    console.error("Update facilitator error:", error);
    return { success: false, message: "Failed to update facilitator." };
  }
}

export async function deleteFacilitator(facilitatorId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized: Only admins can delete facilitators." };
  }

  try {
    await prisma.userFacilitator.delete({
      where: { facilitatorId },
    });

    revalidatePath("/admin/facilitators");
    return { success: true, message: "Facilitator removed successfully." };
  } catch (error) {
    console.error("Delete facilitator error:", error);
    return { success: false, message: "Failed to delete facilitator." };
  }
}

export async function getFacilitatorDetails(facilitatorId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const facilitator = await prisma.userFacilitator.findUnique({
      where: { facilitatorId },
      include: {
        user: {
          include: {
            transactions: true,
            eventAttendances: {
              include: { event: true },
            },
          },
        },
        grantedTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: { select: { name: true } },
          },
        },
        createdPrizes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!facilitator) {
      return { success: false, message: "Facilitator not found." };
    }

    return { success: true, facilitator };
  } catch (error) {
    console.error("Get facilitator details error:", error);
    return { success: false, message: "Failed to fetch facilitator details." };
  }
}

export async function getAvailableUsers() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email || session.user.role !== "admin") {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        facilitator: null,
      },
      orderBy: { name: 'asc' },
      select: {
        userId: true,
        name: true,
        email: true,
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Get available users error:", error);
    return { success: false, message: "Failed to fetch users." };
  }
}
