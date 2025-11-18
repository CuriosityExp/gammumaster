"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditEventDialog } from "./EditEventDialog";
import { DeleteEventAlert } from "./DeleteEventAlert";
import { Calendar, Users, Coins, QrCode, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

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
	const eventUrl = `${globalThis.window === undefined ? "" : globalThis.window.location.origin}/event/${event.eventId}`;

	const copyEventLink = () => {
		navigator.clipboard.writeText(eventUrl);
		toast.success("Event link copied to clipboard!");
	};

	const openEventPage = () => {
		globalThis.window.open(eventUrl, "_blank");
	};

	return (
		<Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 relative">
			{/* Copy Link Button - Top Right */}
			<Button
				variant="secondary"
				size="icon"
				onClick={copyEventLink}
				className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 h-8 w-8 sm:h-9 sm:w-9 rounded-full shadow-md hover:shadow-lg"
				title="Copy event link"
			>
				<Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
			</Button>

			{event.eventBanner && (
				<div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
					<img 
						src={event.eventBanner} 
						alt={event.title}
						className="w-full h-full object-cover"
					/>
					<Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-primary-foreground shadow-lg text-xs">
						<Coins className="mr-1 h-3 w-3" />
						{event.pointAmount} pts
					</Badge>
				</div>
			)}
			<CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
				<CardTitle className="text-lg sm:text-xl line-clamp-2 leading-tight pr-10 sm:pr-12">
					{event.title}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 space-y-3 sm:space-y-4 pb-3 sm:pb-4 px-4 sm:px-6">
				{event.description && (
					<p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
						{event.description}
					</p>
				)}
				<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
					{!event.eventBanner && (
						<div className="flex items-center gap-1.5">
							<Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
							<span className="font-semibold text-foreground">{event.pointAmount} pts</span>
						</div>
					)}
					<div className="flex items-center gap-1.5">
						<Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>{event._count.attendances}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
						<span>{formatDate(event.createdAt)}</span>
					</div>
				</div>
			</CardContent>
			<CardFooter className="gap-1.5 sm:gap-2 pt-3 sm:pt-4 border-t px-4 sm:px-6">
				{/* Action buttons: Open Scanner, Edit, Delete */}
				<Button
					variant="default"
					size="default"
					onClick={openEventPage}
					className="flex-1 min-w-0 h-9 text-sm sm:text-base px-2 sm:px-4"
					title="Open event scanner"
				>
					<QrCode className="h-4 w-4 shrink-0" />
					<span className="hidden lg:inline mx-2 truncate">Scanner</span>
					<span className="hidden sm:inline lg:hidden mx-1 truncate">Open</span>
					<ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 hidden lg:inline" />
				</Button>
				{isAdminView && (
					<>
						<EditEventDialog event={event} />
						<DeleteEventAlert eventId={event.eventId} eventTitle={event.title} />
					</>
				)}
			</CardFooter>
		</Card>
	);
}
