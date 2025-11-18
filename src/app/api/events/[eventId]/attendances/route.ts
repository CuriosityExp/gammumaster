import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { eventId } = await params;

		// Fetch all attendances for this event
		const attendances = await prisma.userEventAttendance.findMany({
			where: {
				eventId: eventId,
			},
			include: {
				user: {
					select: {
						userId: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: [
				{ user: { name: "asc" } },
				{ attendedAt: "desc" },
			],
		});

		// Transform the data to match the expected format
		const transformedAttendances = attendances.map((attendance) => ({
			attendanceId: attendance.id.toString(),
			userId: attendance.userId,
			eventId: attendance.eventId,
			checkInDate: attendance.attendedAt,
			user: attendance.user,
		}));

		return NextResponse.json(transformedAttendances);
	} catch (error) {
		console.error("Error fetching attendances:", error);
		return NextResponse.json(
			{ error: "Failed to fetch attendances" },
			{ status: 500 }
		);
	}
}
