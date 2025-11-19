"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, SwitchCamera, Coins } from "lucide-react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useTranslations } from "next-intl";

interface UserQRScannerProps {
	readonly availablePoints: number;
	readonly granterRole: "admin" | "facilitator";
}

export function UserQRScanner({ availablePoints, granterRole }: Readonly<UserQRScannerProps>) {
	const t = useTranslations('admin');
	const [isScanning, setIsScanning] = useState(true);
	const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
	const [scannedUserId, setScannedUserId] = useState<string | null>(null);
	const [userName, setUserName] = useState<string>("");
	const [pointsToGrant, setPointsToGrant] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleScan = async (result: IDetectedBarcode[]): Promise<void> => {
		if (!isScanning || result.length === 0) return;
		
		setIsScanning(false);
		const { rawValue: qrCodeIdentifier } = result[0];

		toast.info(t('qrDetected'));

		try {
			// Fetch user info by QR code
			const response = await fetch(`/api/users/by-qr/${qrCodeIdentifier}`);
			const data = await response.json();

			if (data.success && data.user) {
				setScannedUserId(data.user.userId);
				setUserName(data.user.name || data.user.email || "User");
				toast.success(t('userFound', { name: data.user.name || data.user.email }), {
					icon: <CheckCircle className="h-5 w-5" />,
				});
			} else {
				toast.error(t('userNotFound'), {
					icon: <XCircle className="h-5 w-5" />,
				});
				setTimeout(() => {
					setIsScanning(true);
				}, 2000);
			}
		} catch (error) {
			console.error("Error fetching user:", error);
			toast.error(t('failedToFetchUser'));
			setTimeout(() => {
				setIsScanning(true);
			}, 2000);
		}
	};

	const handleGrantPoints = async () => {
		if (!scannedUserId || !pointsToGrant) {
			toast.error(t('fillPointsAmount'));
			return;
		}

		const points = Number.parseInt(pointsToGrant);
		if (Number.isNaN(points) || points <= 0) {
			toast.error(t('validPositiveNumber'));
			return;
		}

		if (points > availablePoints) {
			toast.error(t('notEnoughPoints', { points: availablePoints }));
			return;
		}

		setIsSubmitting(true);

		try {
			const formData = new FormData();
			formData.append("points", pointsToGrant);
			if (description) {
				formData.append("description", description);
			}

			const response = await fetch(`/api/users/${scannedUserId}/grant`, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message, {
					icon: <CheckCircle className="h-5 w-5" />,
				});
				// Reset form
				setScannedUserId(null);
				setUserName("");
				setPointsToGrant("");
				setDescription("");
				setIsScanning(true);
				// Refresh the page to update available points
				setTimeout(() => {
					globalThis.location.reload();
				}, 1500);
			} else {
				toast.error(data.message || t('failedToGrant'), {
					icon: <XCircle className="h-5 w-5" />,
				});
			}
		} catch (error) {
			console.error("Error granting points:", error);
			toast.error(t('failedToGrant'));
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setScannedUserId(null);
		setUserName("");
		setPointsToGrant("");
		setDescription("");
		setIsScanning(true);
	};

	const toggleCamera = () => {
		setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
		const camera = facingMode === "environment" ? t('frontCamera') : t('backCamera');
		toast.info(t('switchedToCamera', { camera }));
	};

	return (
		<div className="space-y-6">
			{/* Scanner Card */}
			{!scannedUserId && (
				<Card className="border-2 shadow-lg">
					<CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/20 dark:to-fuchsia-950/20 border-b">
						<CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300">
							<div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12V8m0 4v4m4-4h4m-4 0V8m0 4v4" />
								</svg>
							</div>
							{t('scanUserQR')}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-6">
						<div className="relative w-full rounded-xl overflow-hidden border-4 border-violet-500/20 shadow-inner">
							<div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 pointer-events-none z-10" />
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

						<div className="grid grid-cols-1 gap-3">
							<Button
								onClick={toggleCamera}
								variant="secondary"
								disabled={!isScanning}
								className="w-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800"
							>
								<SwitchCamera className="mr-2 h-4 w-4" />
								{t('switchCamera')}
							</Button>
						</div>

						<div className="text-sm text-center p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900">
							<p className="text-violet-700 dark:text-violet-300 font-medium">
								{t('pointCameraAtUser')}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{t('availablePoints', { points: availablePoints.toLocaleString() })}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Grant Points Form */}
			{scannedUserId && (
				<Card className="border-2 shadow-lg">
					<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b">
						<CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
							<Coins className="h-5 w-5" />
							{t('grantPointsTo', { name: userName })}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-6">
						<div className="space-y-2">
							<Label htmlFor="points">{t('pointsToGrant')} *</Label>
							<Input
								id="points"
								type="number"
								min="1"
								max={availablePoints}
								value={pointsToGrant}
								onChange={(e) => setPointsToGrant(e.target.value)}
								placeholder={t('maxPoints', { points: availablePoints })}
								required
							/>
							<p className="text-xs text-muted-foreground">
								{t('availablePoints', { points: availablePoints.toLocaleString() })}
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">{t('descriptionOptional')}</Label>
							<Textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t('reasonForGranting')}
								rows={3}
							/>
						</div>

						<div className="flex gap-3">
							<Button
								onClick={handleGrantPoints}
								disabled={isSubmitting || !pointsToGrant}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{isSubmitting ? t('processing') : t('grantPoints')}
							</Button>
							<Button
								onClick={handleCancel}
								variant="outline"
								disabled={isSubmitting}
							>
								{t('cancel')}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
