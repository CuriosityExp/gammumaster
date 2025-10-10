// src/app/admin/users/actions.ts

"use server";

import { PrismaClient, TransactionType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

const GrantPointsSchema = z.object({
  points: z.coerce.number().int().positive("Points must be a positive number."),
  description: z.string().optional(),
});

export async function grantPoints(userId: string, formData: FormData) {
  // For now, we'll find the first admin. Later, this will come from the logged-in session.
  const admin = await prisma.admin.findFirst();
  if (!admin) throw new Error("No admin account found.");

  const validatedFields = GrantPointsSchema.safeParse({
    points: formData.get("points"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { points, description } = validatedFields.data;

  if (admin.availablePointsToGrant < points) {
    return { message: "Error: Admin does not have enough points to grant." };
  }

  try {
    // Use a transaction to ensure all database operations succeed or none of them do.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct points from the admin
      const updatedAdmin = await tx.admin.update({
        where: { adminId: admin.adminId },
        data: {
          availablePointsToGrant: {
            decrement: points,
          },
        },
      });

      // 2. Add points to the user
      const updatedUser = await tx.user.update({
        where: { userId: userId },
        data: {
          points: {
            increment: points,
          },
        },
      });

      // 3. Create a log of the transaction
      await tx.pointTransaction.create({
        data: {
          amount: points,
          type: TransactionType.ADMIN_GRANT,
          description: description || `Points granted by admin ${admin.email}`,
          userId: userId,
          adminId: admin.adminId,
        },
      });

      return { updatedUser, updatedAdmin };
    });

    revalidatePath("/admin/users");
    return { message: `Successfully granted ${points} points to ${result.updatedUser.name}.` };

  } catch (error) {
    return { message: "Database transaction failed." };
  }
}