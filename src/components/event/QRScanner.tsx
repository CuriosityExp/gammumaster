"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { recordAttendance } from "@/app/event/[encryptedEventId]/actions";
import { toast } from "sonner";
import { CheckCircle, XCircle, SwitchCamera } from "lucide-react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
	encryptedEventId: string;
}

export function QRScanner({ encryptedEventId }: QRScannerProps) {
	const [isScanning, setIsScanning] = useState(true);
	const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

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

	const toggleCamera = () => {
		setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
		toast.info(`Switched to ${facingMode === "environment" ? "front" : "back"} camera`);
	};

	return (
		<Card className="border-2 shadow-lg">
			<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
				<CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
					<div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12V8m0 4v4m4-4h4m-4 0V8m0 4v4" />
						</svg>
					</div>
					Scan Attendee QR Code
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				<div className="relative w-full rounded-xl overflow-hidden border-4 border-blue-500/20 shadow-inner">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none z-10" />
					<Scanner
						onScan={handleScan}
						onError={(error: unknown) => {
							if (error instanceof Error) {
								console.error(`QR Scanner Error: ${error.message}`);
							}
						}}
						constraints={{
							facingMode: facingMode,
						}}
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<Button
						onClick={toggleCamera}
						variant="secondary"
						disabled={!isScanning}
						className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
					>
						<SwitchCamera className="mr-2 h-4 w-4" />
						Switch Camera
					</Button>
					<Button
						onClick={handleManualInput}
						variant="outline"
						disabled={!isScanning}
						className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
					>
						Manual Entry
					</Button>
				</div>

				<div className="text-sm text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
					<p className="text-blue-700 dark:text-blue-300 font-medium">
						Point the camera at the attendee's QR code to check them in
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
