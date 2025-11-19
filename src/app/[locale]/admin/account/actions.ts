// src/app/admin/account/actions.ts
"use server";

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { createId } from "@paralleldrive/cuid2";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function regenerateAdminQrCode(userId: string) {
  if (!userId) {
    return { error: "User not found. Please log in again." };
  }

  // Get session to determine user role
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Not authenticated. Please log in again." };
  }

  try {
    if (session.user.role === "facilitator") {
      // For facilitators, update the User table
      await prisma.user.update({
        where: { userId: userId },
        data: {
          qrCodeIdentifier: createId(),
        },
      });
    } else {
      // For admins, update the Admin table
      await prisma.admin.update({
        where: { adminId: userId },
        data: {
          qrCodeIdentifier: createId(),
        },
      });
    }

    revalidatePath("/admin/account");
    return { success: "New QR Code generated successfully!" };
  } catch (error) {
    console.error("Error regenerating QR code:", error);
    return { error: "Database Error: Failed to generate new QR Code." };
  }
}