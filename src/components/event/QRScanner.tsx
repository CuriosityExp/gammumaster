"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordAttendance } from "@/app/event/[encryptedEventId]/actions";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
	encryptedEventId: string;
}

export function QRScanner({ encryptedEventId }: QRScannerProps) {
	const [isScanning, setIsScanning] = useState(true);

	const handleScan = async (result: IDetectedBarcode[]): Promise<void> => {
		if (!isScanning || result.length === 0) return;
		
		setIsScanning(false);
		const { rawValue: qrCodeIdentifier } = result[0];

		toast.info("QR Code detected. Processing check-in...");

		try {
			const response = await recordAttendance(encryptedEventId, qrCodeIdentifier);

			if (response.success) {
				toast.success(response.message, {
					description: response.pointsAwarded
						? `${response.pointsAwarded} points awarded`
						: undefined,
					icon: <CheckCircle className="h-5 w-5" />,
				});
			} else {
				toast.error(response.message, {
					icon: <XCircle className="h-5 w-5" />,
				});
			}
		} catch (error) {
			console.error("Error processing QR code:", error);
			toast.error("Failed to process check-in");
		} finally {
			// Re-enable scanning after 2 seconds
			setTimeout(() => {
				setIsScanning(true);
			}, 2000);
		}
	};

	const handleManualInput = async () => {
		const qrCode = prompt("Enter user QR code identifier:");
		if (qrCode) {
			setIsScanning(false);
			toast.info("Processing check-in...");

			try {
				const response = await recordAttendance(encryptedEventId, qrCode);

				if (response.success) {
					toast.success(response.message, {
						description: response.pointsAwarded
							? `${response.pointsAwarded} points awarded`
							: undefined,
						icon: <CheckCircle className="h-5 w-5" />,
					});
				} else {
					toast.error(response.message, {
						icon: <XCircle className="h-5 w-5" />,
					});
				}
			} catch (error) {
				console.error("Error processing QR code:", error);
				toast.error("Failed to process check-in");
			} finally {
				setTimeout(() => {
					setIsScanning(true);
				}, 2000);
			}
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Scan Attendee QR Code</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="w-full rounded-lg overflow-hidden border">
					<Scanner
						onScan={handleScan}
						onError={(error: unknown) => {
							if (error instanceof Error) {
								console.error(`QR Scanner Error: ${error.message}`);
							}
						}}
					/>
				</div>

				<Button
					onClick={handleManualInput}
					variant="outline"
					disabled={!isScanning}
					className="w-full"
				>
					Manual Entry
				</Button>

				<div className="text-sm text-muted-foreground text-center">
					<p>Point the camera at the attendee's QR code to check them in</p>
				</div>
			</CardContent>
		</Card>
	);
}
