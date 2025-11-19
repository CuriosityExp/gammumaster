// src/app/[locale]/admin/scan-grant/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PrismaClient } from "@/generated/prisma";
import { UserQRScanner } from "@/components/admin/UserQRScanner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function ScanGrantPage({
	params,
}: Readonly<{
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;
	const session = await getServerSession(authOptions);
	const t = await getTranslations('admin');

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect(`/${locale}/admin/login`);
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	let availablePoints = 0;

	if (isAdmin) {
		const admin = await prisma.admin.findUnique({
			where: { email: session.user.email! },
			select: { availablePointsToGrant: true },
		});
		availablePoints = admin?.availablePointsToGrant || 0;
	} else if (isFacilitator) {
		const facilitator = await prisma.userFacilitator.findUnique({
			where: { userId: session.user.id },
			select: { availablePointsToGrant: true },
		});
		availablePoints = facilitator?.availablePointsToGrant || 0;
	}

	return (
		<div className="container mx-auto p-6 max-w-3xl">
			{/* Header */}
			<div className="mb-8">
				<Link
					href={`/${locale}/admin`}
					className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
				>
					<ArrowLeft className="h-4 w-4" />
					{t('backToDashboard')}
				</Link>
				
				<div className="flex items-start gap-4">
					<div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg flex-shrink-0">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h-4.01M12 12V8m0 4v4m4-4h4m-4 0V8m0 4v4" />
						</svg>
					</div>
					<div className="flex-1">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
							{t('scanToGrant')}
						</h1>
						<p className="text-base text-muted-foreground">
							{t('scanToGrantDesc')}
						</p>
					</div>
				</div>
			</div>

			{/* Available Points Banner */}
			<div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium opacity-90">{t('availablePointsToGrantBanner')}</p>
						<p className="text-3xl font-bold">💎 {availablePoints.toLocaleString()}</p>
					</div>
					<div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>

			{/* Scanner Component */}
			<UserQRScanner 
				availablePoints={availablePoints}
				granterRole={session.user.role}
			/>
		</div>
	);
}
