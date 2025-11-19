"use server";

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export interface AttendanceResult {
	success: boolean;
	message: string;
	userName?: string;
	pointsAwarded?: number;
}

export async function recordAttendance(
	encryptedEventId: string,
	userQrCodeIdentifier: string,
): Promise<AttendanceResult> {
	try {
		// Find the event by its encrypted ID (you may need to decrypt it based on your encryption strategy)
		// For now, treating encryptedEventId as the actual eventId
		const event = await prisma.event.findUnique({
			where: { eventId: encryptedEventId, deletedAt: null },
		});

		if (!event) {
			return {
				success: false,
				message: "Event not found or has been deleted",
			};
		}

		// Find the user by QR code identifier
		const user = await prisma.user.findUnique({
			where: { qrCodeIdentifier: userQrCodeIdentifier },
		});

		if (!user) {
			return {
				success: false,
				message: "User not found. Invalid QR code.",
			};
		}

		// Check if user has already attended this event
		const existingAttendance = await prisma.userEventAttendance.findUnique({
			where: {
				userId_eventId: {
					userId: user.userId,
					eventId: event.eventId,
				},
			},
		});

		if (existingAttendance) {
			return {
				success: false,
				message: `${user.name || "User"} has already checked in to this event`,
				userName: user.name || undefined,
			};
		}

		// Record attendance and award points in a transaction
		await prisma.$transaction(async (tx) => {
			// Create attendance record
			await tx.userEventAttendance.create({
				data: {
					userId: user.userId,
					eventId: event.eventId,
				},
			});

			// Award points to user
			await tx.user.update({
				where: { userId: user.userId },
				data: { points: { increment: event.pointAmount } },
			});

			// Create point transaction record
			await tx.pointTransaction.create({
				data: {
					userId: user.userId,
					amount: event.pointAmount,
					type: "EVENT_TOPUP",
					description: `Attended event: ${event.title}`,
				},
			});
		});

		revalidatePath(`/event/${encryptedEventId}`);

		return {
			success: true,
			message: `Successfully checked in ${user.name || "user"}!`,
			userName: user.name || undefined,
			pointsAwarded: event.pointAmount,
		};
	} catch (error) {
		console.error("Error recording attendance:", error);
		return {
			success: false,
			message: "Failed to record attendance. Please try again.",
		};
	}
}

export async function getEventDetails(encryptedEventId: string) {
	try {
		const event = await prisma.event.findUnique({
			where: { eventId: encryptedEventId, deletedAt: null },
			include: {
				attendances: {
					include: {
						user: {
							select: {
								name: true,
								email: true,
							},
						},
					},
					orderBy: {
						attendedAt: "desc",
					},
				},
			},
		});

		return event;
	} catch (error) {
		console.error("Error fetching event details:", error);
		return null;
	}
}
