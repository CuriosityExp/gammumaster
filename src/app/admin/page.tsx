import { AdminMenuCard } from "@/components/admin/AdminMenuCard";
import { Gift, Calendar, Users, User, Shield } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect("/admin/login");
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">
					{isFacilitator ? "Facilitator" : "Admin"} Dashboard
				</h1>
				<p className="text-muted-foreground">
					Select a section to manage
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<AdminMenuCard
					title="Prize Management"
					description="Create, edit, and manage prizes that users can redeem"
					icon={<Gift className="h-8 w-8" />}
					href="/admin/prizes"
				/>
				
				{isAdmin && (
					<>
						<AdminMenuCard
							title="Event Management"
							description="Create and manage events with QR check-in"
							icon={<Calendar className="h-8 w-8" />}
							href="/admin/events"
						/>
						<AdminMenuCard
							title="User Management"
							description="View users and manage their points"
							icon={<Users className="h-8 w-8" />}
							href="/admin/users"
						/>
						<AdminMenuCard
							title="Facilitator Management"
							description="Manage facilitator accounts and permissions"
							icon={<Shield className="h-8 w-8" />}
							href="/admin/facilitators"
						/>
					</>
				)}

				{isFacilitator && (
					<>
						<AdminMenuCard
							title="Event Scanner"
							description="View events and access QR scanner"
							icon={<Calendar className="h-8 w-8" />}
							href="/admin/events"
						/>
						<AdminMenuCard
							title="Grant Points"
							description="Grant points to users from your balance"
							icon={<Users className="h-8 w-8" />}
							href="/admin/users"
						/>
					</>
				)}

				<AdminMenuCard
					title="Account Settings"
					description="Manage your account and settings"
					icon={<User className="h-8 w-8" />}
					href="/admin/account"
				/>
			</div>
		</div>
	);
}
