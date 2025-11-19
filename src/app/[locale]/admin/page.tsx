import { AdminMenuCard } from "@/components/admin/AdminMenuCard";
import { Gift, Calendar, Users, User, Shield, QrCode } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({
	params,
}: Readonly<{
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;
	const t = await getTranslations('admin');
	const session = await getServerSession(authOptions);

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect(`/${locale}/admin/login`);
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<div className="inline-flex items-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
						<Shield className="h-6 w-6 text-white" />
					</div>
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
							{isFacilitator ? t('facilitatorDashboard') : t('dashboard')}
						</h1>
						<p className="text-muted-foreground">
							{t('selectSection')}
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="relative group hover:scale-105 transition-transform duration-200">
					<div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
				<AdminMenuCard
					title={t('prizeManagement')}
					description={t('prizeManagementDesc')}
					icon={<Gift className="h-8 w-8 text-amber-500" />}
					href={`/${locale}/admin/prizes`}
						iconBgColor="bg-amber-500/10"
						iconHoverBgColor="group-hover:bg-amber-500/20"
						hoverBorderColor="hover:border-amber-500"
					/>
				</div>
				
				{isAdmin && (
					<>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('eventManagement')}
							description={t('eventManagementDesc')}
							icon={<Calendar className="h-8 w-8 text-blue-500" />}
							href={`/${locale}/admin/events`}
								iconBgColor="bg-blue-500/10"
								iconHoverBgColor="group-hover:bg-blue-500/20"
								hoverBorderColor="hover:border-blue-500"
							/>
						</div>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('userManagement')}
							description={t('userManagementDesc')}
							icon={<Users className="h-8 w-8 text-green-500" />}
							href={`/${locale}/admin/users`}
								iconBgColor="bg-green-500/10"
								iconHoverBgColor="group-hover:bg-green-500/20"
								hoverBorderColor="hover:border-green-500"
							/>
						</div>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('facilitatorManagement')}
							description={t('facilitatorManagementDesc')}
							icon={<Shield className="h-8 w-8 text-purple-500" />}
							href={`/${locale}/admin/facilitators`}
								iconBgColor="bg-purple-500/10"
								iconHoverBgColor="group-hover:bg-purple-500/20"
								hoverBorderColor="hover:border-purple-500"
							/>
						</div>
					</>
				)}

				{isFacilitator && (
					<>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('eventScannerAccess')}
							description={t('eventScannerDesc')}
							icon={<Calendar className="h-8 w-8 text-blue-500" />}
							href={`/${locale}/admin/events`}
								iconBgColor="bg-blue-500/10"
								iconHoverBgColor="group-hover:bg-blue-500/20"
								hoverBorderColor="hover:border-blue-500"
							/>
						</div>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('grantPoints')}
							description={t('grantPointsDesc')}
							icon={<Users className="h-8 w-8 text-green-500" />}
							href={`/${locale}/admin/users`}
								iconBgColor="bg-green-500/10"
								iconHoverBgColor="group-hover:bg-green-500/20"
								hoverBorderColor="hover:border-green-500"
							/>
						</div>
						<div className="relative group hover:scale-105 transition-transform duration-200">
							<div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
						<AdminMenuCard
							title={t('scanToGrant')}
							description={t('scanToGrantDesc')}
							icon={<QrCode className="h-8 w-8 text-violet-500" />}
							href={`/${locale}/admin/scan-grant`}
								iconBgColor="bg-violet-500/10"
								iconHoverBgColor="group-hover:bg-violet-500/20"
								hoverBorderColor="hover:border-violet-500"
							/>
						</div>
					</>
				)}

				<div className="relative group hover:scale-105 transition-transform duration-200">
					<div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
				<AdminMenuCard
					title={t('accountSettings')}
					description={t('accountSettingsDesc')}
					icon={<User className="h-8 w-8 text-slate-500" />}
					href={`/${locale}/admin/account`}
						iconBgColor="bg-slate-500/10"
						iconHoverBgColor="group-hover:bg-slate-500/20"
						hoverBorderColor="hover:border-slate-500"
					/>
				</div>
			</div>
		</div>
	);
}
