// src/app/api/users/by-qr/[qrCode]/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ qrCode: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { qrCode } = await params;

		const user = await prisma.user.findUnique({
			where: { qrCodeIdentifier: qrCode },
			select: {
				userId: true,
				name: true,
				email: true,
				points: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			user,
		});
	} catch (error) {
		console.error("Error fetching user by QR:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
