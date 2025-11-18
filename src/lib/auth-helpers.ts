// src/lib/auth-helpers.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function requireAdmin() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email || session.user.role !== "admin") {
		return null;
	}

	const admin = await prisma.admin.findUnique({
		where: { email: session.user.email },
	});

	return admin;
}

export async function requireFacilitator() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email || session.user.role !== "facilitator") {
		return null;
	}

	const facilitator = await prisma.userFacilitator.findUnique({
		where: { email: session.user.email },
	});

	return facilitator;
}

export async function requireAdminOrFacilitator() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return { type: null, user: null };
	}

	if (session.user.role === "admin") {
		const admin = await prisma.admin.findUnique({
			where: { email: session.user.email },
		});
		return { type: "admin" as const, user: admin };
	}

	if (session.user.role === "facilitator") {
		const facilitator = await prisma.userFacilitator.findUnique({
			where: { email: session.user.email },
		});
		return { type: "facilitator" as const, user: facilitator };
	}

	return { type: null, user: null };
}

export function canManageUsers(role?: string) {
	return role === "admin";
}

export function canGrantPoints(role?: string) {
	return role === "admin";
}

export function canManagePrizes(role?: string) {
	return role === "admin" || role === "facilitator";
}

export function canViewEventScanner(role?: string) {
	return role === "admin" || role === "facilitator";
}

export function canManageEvents(role?: string) {
	return role === "admin";
}
