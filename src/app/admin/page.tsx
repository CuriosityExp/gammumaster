import { AdminMenuCard } from "@/components/admin/AdminMenuCard";
import { Gift, Calendar, Users, User } from "lucide-react";

export default function AdminDashboard() {
	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
					title="Account Settings"
					description="Manage your admin account and settings"
					icon={<User className="h-8 w-8" />}
					href="/admin/account"
				/>
			</div>
		</div>
	);
}
