"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditEventDialog } from "./EditEventDialog";
import { DeleteEventAlert } from "./DeleteEventAlert";
import { Calendar, Users, Coins, QrCode, Copy } from "lucide-react";
import { toast } from "sonner";

interface EventCardProps {
	readonly event: {
		eventId: string;
		title: string;
		description: string | null;
		eventBanner: string | null;
		pointAmount: number;
		createdAt: Date;
		createdBy: {
			email: string;
		};
		_count: {
			attendances: number;
		};
	};
	readonly isAdminView?: boolean; // Whether to show edit/delete buttons
}

export function EventCard({ event, isAdminView = true }: EventCardProps) {
	const eventUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/event/${event.eventId}`;

	const copyEventLink = () => {
		navigator.clipboard.writeText(eventUrl);
		toast.success("Event link copied to clipboard!");
	};

	const openEventPage = () => {
		window.open(eventUrl, "_blank");
	};

	return (
		<Card>
			{event.eventBanner && (
				<div className="aspect-video w-full overflow-hidden rounded-t-lg">
					<img 
						src={event.eventBanner} 
						alt={event.title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}
			<CardHeader>
				<CardTitle className="flex items-start justify-between">
					<span className="line-clamp-2">{event.title}</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{event.description && (
					<p className="text-sm text-muted-foreground line-clamp-3">
						{event.description}
					</p>
				)}
				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2">
						<Coins className="h-4 w-4 text-muted-foreground" />
						<span className="font-semibold">{event.pointAmount} points</span>
					</div>
					<div className="flex items-center gap-2">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span>{event._count.attendances} attendees</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span>{new Date(event.createdAt).toLocaleDateString()}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col gap-2">
				<div className="flex gap-2 w-full">
					<Button
						variant="secondary"
						size="sm"
						onClick={openEventPage}
						className="flex-1"
					>
						<QrCode className="mr-2 h-4 w-4" />
						Open Scanner
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={copyEventLink}
					>
						<Copy className="h-4 w-4" />
					</Button>
				</div>
				{/* Only show edit/delete buttons for admins */}
				{isAdminView && (
					<div className="flex gap-2 w-full">
						<EditEventDialog event={event} />
						<DeleteEventAlert eventId={event.eventId} eventTitle={event.title} />
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
