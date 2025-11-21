// src/app/admin/prizes/actions.ts

"use server"; // Defines this as a server-side only file

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

// Define the schema for our prize data using Zod
const PrizeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  description: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  pointCost: z.coerce.number().int().min(1, "Point cost must be at least 1"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  isEnabled: z.coerce.boolean().optional(),
});


export async function createPrize(formData: FormData) {
  // Find an admin to associate the prize with (in a real app, this would be the logged-in admin)
  const admin = await prisma.admin.findFirst();
  if (!admin) {
    throw new Error("No admin account found to associate prize with.");
  }

  const validatedFields = PrizeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    pointCost: formData.get("pointCost"),
    stock: formData.get("stock"),
    isEnabled: formData.get("isEnabled") === "on" || formData.get("isEnabled") === "true",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.prize.create({
      data: {
        ...validatedFields.data,
        adminId: admin.adminId,
      },
    });

    // Revalidate the prizes page so the new prize appears instantly
    revalidatePath("/admin/prizes");
    return { message: "Prize created successfully." };

  } catch (error) {
    return { message: "Database Error: Failed to create prize." };
  }
}

export async function updatePrize(prizeId: string, formData: FormData) {
  const validatedFields = PrizeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    pointCost: formData.get("pointCost"),
    stock: formData.get("stock"),
    isEnabled: formData.get("isEnabled") === "on" || formData.get("isEnabled") === "true",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.prize.update({
      where: { prizeId: prizeId },
      data: validatedFields.data,
    });

    revalidatePath("/admin/prizes");
    return { message: "Prize updated successfully." };

  } catch (error) {
    return { message: "Database Error: Failed to update prize." };
  }
}

export async function deletePrize(prizeId: string) {
  try {
    // Change from .delete() to .update()
    await prisma.prize.update({
      where: { prizeId: prizeId },
      data: {
        deletedAt: new Date(), // Set the current timestamp
      },
    });
    revalidatePath("/admin/prizes");
    return { message: "Prize archived successfully." };
  } catch (error) {
    return { message: "Database Error: Failed to archive prize." };
  }
}