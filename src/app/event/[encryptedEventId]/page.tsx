import { QRScanner } from "@/components/event/QRScanner";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function EventAttendancePage({
	params,
}: Readonly<{
	params: Promise<{ encryptedEventId: string }>;
}>) {
	// Check if user is authenticated as admin or facilitator
	const session = await getServerSession(authOptions);
	
	if (!session?.user?.email) {
		redirect("/admin/login");
	}

	// Verify the user is an admin or facilitator
	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	if (!isAdmin && !isFacilitator) {
		redirect("/admin/login");
	}

	if (isAdmin) {
		const admin = await prisma.admin.findUnique({
			where: { email: session.user.email },
		});
		if (!admin) {
			redirect("/admin/login");
		}
	} else if (isFacilitator) {
		const facilitator = await prisma.userFacilitator.findUnique({
			where: { userId: session.user.id },
		});
		if (!facilitator) {
			redirect("/admin/login");
		}
	}

	const { encryptedEventId } = await params;

	if (!encryptedEventId) {
		notFound();
	}

	// Verify the event exists and is not deleted
	const event = await prisma.event.findUnique({
		where: { eventId: encryptedEventId, deletedAt: null },
	});

	if (!event) {
		notFound();
	}

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<div className="space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Event Check-In</h1>
					<p className="text-muted-foreground mt-2">
						{event.title}
					</p>
					<p className="text-sm text-muted-foreground">
						Scan attendee QR code to check them in
					</p>
				</div>

				<QRScanner encryptedEventId={encryptedEventId} />
			</div>
		</div>
	);
}
