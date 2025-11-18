import { getAllEvents } from "./actions";
import { CreateEventDialog } from "@/components/event/CreateEventDialog";
import { EventCard } from "@/components/event/EventCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminEventsPage() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect("/admin/login");
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	const events = await getAllEvents();

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">
						{isFacilitator ? "Event Scanner Access" : "Event Management"}
					</h1>
					<p className="text-muted-foreground">
						{isFacilitator 
							? "View events and access QR scanner for check-ins"
							: "Create and manage events for user check-ins"
						}
					</p>
				</div>
				{/* Only admins can create events */}
				{isAdmin && <CreateEventDialog />}
			</div>

			{events.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{isFacilitator ? "No events available" : "No events yet. Create your first event!"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{events.map((event) => (
						<EventCard key={event.eventId} event={event} isAdminView={isAdmin} />
					))}
				</div>
			)}
		</div>
	);
}
