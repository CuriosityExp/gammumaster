// src/app/admin/account/actions.ts
"use server";

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2"; // <-- 1. Changed import

const prisma = new PrismaClient();

export async function regenerateAdminQrCode(adminId: string) {
  if (!adminId) {
    return { error: "Admin not found. Please log in again." };
  }

  try {
    await prisma.admin.update({
      where: { adminId: adminId },
      data: {
        // 2. Using the new createId() function
        qrCodeIdentifier: createId(),
      },
    });

    revalidatePath("/admin/account");
    return { success: "New QR Code generated successfully!" };
  } catch (error) {
    return { error: "Database Error: Failed to generate new QR Code." };
  }
}