"use server";

import { PrismaClient } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function createEvent(formData: FormData) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return { success: false, message: "Unauthorized" };
	}

	const admin = await prisma.admin.findUnique({
		where: { email: session.user.email },
	});

	if (!admin) {
		return { success: false, message: "Admin not found" };
	}

	try {
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const eventBanner = formData.get("eventBanner") as string;
		const pointAmount = Number.parseInt(formData.get("pointAmount") as string);

		if (!title || !pointAmount || pointAmount < 0) {
			return { success: false, message: "Invalid input" };
		}

		const event = await prisma.event.create({
			data: {
				title,
				description: description || null,
				eventBanner: eventBanner || null,
				pointAmount,
				adminId: admin.adminId,
			},
		});

		revalidatePath("/admin/events");
		return {
			success: true,
			message: "Event created successfully",
			eventId: event.eventId,
		};
	} catch (error) {
		console.error("Error creating event:", error);
		return { success: false, message: "Failed to create event" };
	}
}

export async function updateEvent(eventId: string, formData: FormData) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return { success: false, message: "Unauthorized" };
	}

	try {
		const title = formData.get("title") as string;
		const description = formData.get("description") as string;
		const eventBanner = formData.get("eventBanner") as string;
		const pointAmount = Number.parseInt(formData.get("pointAmount") as string);

		if (!title || !pointAmount || pointAmount < 0) {
			return { success: false, message: "Invalid input" };
		}

		await prisma.event.update({
			where: { eventId },
			data: {
				title,
				description: description || null,
				eventBanner: eventBanner || null,
				pointAmount,
			},
		});

		revalidatePath("/admin/events");
		return { success: true, message: "Event updated successfully" };
	} catch (error) {
		console.error("Error updating event:", error);
		return { success: false, message: "Failed to update event" };
	}
}

export async function deleteEvent(eventId: string) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return { success: false, message: "Unauthorized" };
	}

	try {
		// Soft delete
		await prisma.event.update({
			where: { eventId },
			data: { deletedAt: new Date() },
		});

		revalidatePath("/admin/events");
		return { success: true, message: "Event deleted successfully" };
	} catch (error) {
		console.error("Error deleting event:", error);
		return { success: false, message: "Failed to delete event" };
	}
}

export async function getAllEvents(searchQuery?: string, page?: number) {
	try {
		// Build WHERE clause
		const where = {
			deletedAt: null,
			...(searchQuery && {
				OR: [
					{ title: { contains: searchQuery } },
					{ description: { contains: searchQuery } },
				],
			}),
		};

		// If pagination parameters provided, use them
		if (page !== undefined) {
			const ITEMS_PER_PAGE = 9; // 3x3 grid
			const skip = (page - 1) * ITEMS_PER_PAGE;

			const [events, totalCount] = await Promise.all([
				prisma.event.findMany({
					where,
					include: {
						createdBy: {
							select: {
								email: true,
							},
						},
						_count: {
							select: {
								attendances: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					skip,
					take: ITEMS_PER_PAGE,
				}),
				prisma.event.count({ where }),
			]);

			return {
				events,
				totalCount,
				totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
			};
		}

		// Without pagination (backward compatible)
		const events = await prisma.event.findMany({
			where,
			include: {
				createdBy: {
					select: {
						email: true,
					},
				},
				_count: {
					select: {
						attendances: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});

		return events;
	} catch (error) {
		console.error("Error fetching events:", error);
		return [];
	}
}
