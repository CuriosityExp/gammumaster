import { QRScanner } from "@/components/event/QRScanner";
import { notFound } from "next/navigation";

export default async function EventAttendancePage({
	params,
}: {
	params: Promise<{ encryptedEventId: string }>;
}) {
	const { encryptedEventId } = await params;

	if (!encryptedEventId) {
		notFound();
	}

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<div className="space-y-6">
				<div className="text-center">
					<h1 className="text-3xl font-bold">Event Check-In</h1>
					<p className="text-muted-foreground mt-2">
						Scan attendee QR code to check them in
					</p>
				</div>

				<QRScanner encryptedEventId={encryptedEventId} />
			</div>
		</div>
	);
}
