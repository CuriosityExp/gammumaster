// src/app/api/users/[userId]/grant/route.ts

import { NextResponse } from "next/server";
import { PrismaClient, TransactionType } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

const GrantPointsSchema = z.object({
	points: z.coerce.number().int().positive("Points must be a positive number."),
	description: z.string().optional(),
});

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized: Please log in." },
				{ status: 401 }
			);
		}

		const { userId } = await params;
		const formData = await request.formData();

		const validatedFields = GrantPointsSchema.safeParse({
			points: formData.get("points"),
			description: formData.get("description"),
		});

		if (!validatedFields.success) {
			return NextResponse.json(
				{ success: false, message: "Invalid input", errors: validatedFields.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { points, description } = validatedFields.data;

		// Check if user is admin or facilitator
		if (session.user.role === "admin") {
			const admin = await prisma.admin.findUnique({
				where: { email: session.user.email },
			});

			if (!admin) {
				return NextResponse.json(
					{ success: false, message: "Error: Admin account not found." },
					{ status: 404 }
				);
			}

			if (admin.availablePointsToGrant < points) {
				return NextResponse.json(
					{ success: false, message: "Error: You do not have enough points to grant." },
					{ status: 400 }
				);
			}

			// Use a transaction to ensure all database operations succeed or none of them do
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

			revalidatePath("/dashboard");

			return NextResponse.json({
				success: true,
				message: `Successfully granted ${points} points to ${result.updatedUser.name}.`,
			});

		} else if (session.user.role === "facilitator") {
			const facilitator = await prisma.userFacilitator.findUnique({
				where: { userId: session.user.id },
			});

			if (!facilitator) {
				return NextResponse.json(
					{ success: false, message: "Error: Facilitator account not found." },
					{ status: 404 }
				);
			}

			if (facilitator.availablePointsToGrant < points) {
				return NextResponse.json(
					{ success: false, message: "Error: You do not have enough points to grant." },
					{ status: 400 }
				);
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

			revalidatePath("/dashboard");

			return NextResponse.json({
				success: true,
				message: `Successfully granted ${points} points to ${result.updatedUser.name}.`,
			});

		} else {
			return NextResponse.json(
				{ success: false, message: "Error: Unauthorized role." },
				{ status: 403 }
			);
		}

	} catch (error) {
		console.error("Grant points error:", error);
		return NextResponse.json(
			{ success: false, message: "Database transaction failed." },
			{ status: 500 }
		);
	}
}
