import { QRScanner } from "@/components/event/QRScanner";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export default async function EventAttendancePage({
	params,
}: Readonly<{
	params: Promise<{ encryptedEventId: string; locale: string }>;
}>) {
	// Check if user is authenticated as admin or facilitator
	const session = await getServerSession(authOptions);
	const { encryptedEventId, locale } = await params;
	
	if (!session?.user?.email) {
		redirect(`/${locale}/admin/login`);
	}

	// Verify the user is an admin or facilitator
	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	if (!isAdmin && !isFacilitator) {
		redirect(`/${locale}/admin/login`);
	}

	if (isAdmin) {
		const admin = await prisma.admin.findUnique({
			where: { email: session.user.email },
		});
		if (!admin) {
			redirect(`/${locale}/admin/login`);
		}
	} else if (isFacilitator) {
		const facilitator = await prisma.userFacilitator.findUnique({
			where: { userId: session.user.id },
		});
		if (!facilitator) {
			redirect(`/${locale}/admin/login`);
		}
	}

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
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-8 text-white shadow-xl">
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
					<div className="relative z-10 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12V8m0 4v4m4-4h4m-4 0V8m0 4v4" />
							</svg>
						</div>
						<h1 className="text-3xl font-bold mb-2">Event Check-In</h1>
						<p className="text-blue-100 text-lg font-medium mb-1">
							{event.title}
						</p>
						<p className="text-blue-200/80 text-sm">
							Scan attendee QR code to check them in
						</p>
					</div>
				</div>

				<QRScanner encryptedEventId={encryptedEventId} />
			</div>
		</div>
	);
}
