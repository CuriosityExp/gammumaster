import { getAllEvents } from "./actions";
import { CreateEventDialog } from "@/components/event/CreateEventDialog";
import { EventCard } from "@/components/event/EventCard";

export default async function AdminEventsPage() {
	const events = await getAllEvents();

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold">Event Management</h1>
					<p className="text-muted-foreground">
						Create and manage events for user check-ins
					</p>
				</div>
				<CreateEventDialog />
			</div>

			{events.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No events yet. Create your first event!
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{events.map((event) => (
						<EventCard key={event.eventId} event={event} />
					))}
				</div>
			)}
		</div>
	);
}
