// src/app/admin/users/actions.ts

"use server";

import { PrismaClient, TransactionType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

const GrantPointsSchema = z.object({
  points: z.coerce.number().int().positive("Points must be a positive number."),
  description: z.string().optional(),
});

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const UpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

const EditPointsSchema = z.object({
  points: z.coerce.number().int("Points must be an integer"),
  reason: z.string().optional(),
});

export async function grantPoints(userId: string, formData: FormData) {
  // Get the current session to determine if admin or facilitator
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  const validatedFields = GrantPointsSchema.safeParse({
    points: formData.get("points"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { points, description } = validatedFields.data;

  try {
    // Check if user is admin or facilitator
    if (session.user.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
      });

      if (!admin) {
        return { success: false, message: "Error: Admin account not found." };
      }

      if (admin.availablePointsToGrant < points) {
        return { success: false, message: "Error: You do not have enough points to grant." };
      }

      // Use a transaction to ensure all database operations succeed or none of them do.
      const result = await prisma.$transaction(async (tx) => {
        // 1. Deduct points from the admin
        await tx.admin.update({
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

        return { updatedUser };
      });

      revalidatePath("/admin/users");
      return { success: true, message: `Successfully granted ${points} points to ${result.updatedUser.name}.` };

    } else if (session.user.role === "facilitator") {
      const facilitator = await prisma.userFacilitator.findUnique({
        where: { userId: session.user.id },
      });

      if (!facilitator) {
        return { success: false, message: "Error: Facilitator account not found." };
      }

      if (facilitator.availablePointsToGrant < points) {
        return { success: false, message: "Error: You do not have enough points to grant." };
      }

      // Use a transaction for facilitator grants
      const result = await prisma.$transaction(async (tx) => {
        // 1. Deduct points from the facilitator
        await tx.userFacilitator.update({
          where: { facilitatorId: facilitator.facilitatorId },
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
            description: description || `Points granted by facilitator (User ID: ${facilitator.userId})`,
            userId: userId,
            facilitatorId: facilitator.facilitatorId,
          },
        });

        return { updatedUser };
      });

      revalidatePath("/admin/users");
      return { success: true, message: `Successfully granted ${points} points to ${result.updatedUser.name}.` };

    } else {
      return { success: false, message: "Error: Unauthorized role." };
    }

  } catch (error) {
    console.error("Grant points error:", error);
    return { success: false, message: "Database transaction failed." };
  }
}

export async function createUser(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  // Check if admin or facilitator
  if (session.user.role !== "admin" && session.user.role !== "facilitator") {
    return { success: false, message: "Unauthorized: Only admins and facilitators can create users." };
  }

  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email } = validatedFields.data;

  try {
    // Get admin ID for tracking
    let adminId: string | undefined;
    if (session.user.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
      });
      adminId = admin?.adminId;
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email || null,
        adminId: adminId,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: `User "${name}" created successfully.`, user: newUser };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, message: "Failed to create user. Email might already exist." };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (session.user.role !== "admin" && session.user.role !== "facilitator") {
    return { success: false, message: "Unauthorized: Only admins and facilitators can update users." };
  }

  const validatedFields = UpdateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email } = validatedFields.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        name,
        email: email || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, message: `User "${name}" updated successfully.`, user: updatedUser };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user. Email might already exist." };
  }
}

export async function deleteUser(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (session.user.role !== "admin") {
    return { success: false, message: "Unauthorized: Only admins can delete users." };
  }

  try {
    // Soft delete
    await prisma.user.update({
      where: { userId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user." };
  }
}

export async function editUserPoints(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (session.user.role !== "admin") {
    return { success: false, message: "Unauthorized: Only admins can edit points directly." };
  }

  const validatedFields = EditPointsSchema.safeParse({
    points: formData.get("points"),
    reason: formData.get("reason"),
  });

  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors };
  }

  const { points, reason } = validatedFields.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return { success: false, message: "Error: Admin account not found." };
    }

    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return { success: false, message: "Error: User not found." };
    }

    const pointDifference = points - user.points;

    // Update user points directly
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { userId },
        data: { points },
      });

      // Log the transaction if there's a change
      if (pointDifference !== 0) {
        await tx.pointTransaction.create({
          data: {
            amount: pointDifference,
            type: TransactionType.ADMIN_GRANT,
            description: reason || `Points adjusted by admin ${admin.email} (Direct edit: ${user.points} → ${points})`,
            userId: userId,
            adminId: admin.adminId,
          },
        });
      }

      return { updatedUser };
    });

    revalidatePath("/admin/users");
    return { success: true, message: `User points updated to ${points}.` };
  } catch (error) {
    console.error("Edit points error:", error);
    return { success: false, message: "Failed to edit user points." };
  }
}

export async function getUserDetails(userId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (session.user.role !== "admin" && session.user.role !== "facilitator") {
    return { success: false, message: "Unauthorized." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            admin: { select: { email: true } },
            facilitator: { select: { userId: true } },
          },
        },
        eventAttendances: {
          orderBy: { attendedAt: 'desc' },
          take: 5,
          include: {
            event: { select: { title: true, pointAmount: true } },
          },
        },
        createdBy: { select: { email: true } },
      },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Get user details error:", error);
    return { success: false, message: "Failed to fetch user details." };
  }
}