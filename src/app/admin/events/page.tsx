import { getAllEvents } from "./actions";
import { CreateEventDialog } from "@/components/event/CreateEventDialog";
import { EventCard } from "@/components/event/EventCard";
import { SearchInput } from "@/components/admin/SearchInput";
import { CardGridSkeleton } from "@/components/admin/CardGridSkeleton";
import { Suspense } from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminEventsPage({
	searchParams,
}: Readonly<{
	searchParams: Promise<{ search?: string; page?: string }>;
}>) {
	const session = await getServerSession(authOptions);

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect("/admin/login");
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	const params = await searchParams;
	const searchQuery = params.search || "";
	const currentPage = Number(params.page) || 1;

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

			{/* Search Bar */}
			<div className="mb-6">
				<div className="max-w-md">
					<SearchInput 
						placeholder="Search events by title or description..." 
						basePath="/admin/events"
					/>
				</div>
			</div>

			<Suspense key={`${searchQuery}-${currentPage}`} fallback={<CardGridSkeleton count={9} />}>
				<EventsGrid 
					searchQuery={searchQuery} 
					currentPage={currentPage}
					isAdmin={isAdmin}
					isFacilitator={isFacilitator}
				/>
			</Suspense>
		</div>
	);
}

async function EventsGrid({ 
	searchQuery, 
	currentPage,
	isAdmin,
	isFacilitator,
}: Readonly<{
	searchQuery: string;
	currentPage: number;
	isAdmin: boolean;
	isFacilitator: boolean;
}>) {
	const result = await getAllEvents(searchQuery, currentPage);

	// Handle both paginated and non-paginated responses
	const events = Array.isArray(result) ? result : result.events;
	const totalCount = Array.isArray(result) ? result.length : result.totalCount;
	const totalPages = Array.isArray(result) ? 1 : result.totalPages;

	// Determine empty state message
	const getEmptyMessage = () => {
		if (searchQuery) return "No events found matching your search";
		if (isFacilitator) return "No events available";
		return "No events yet. Create your first event!";
	};

	return (
		<>
			{events.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						{getEmptyMessage()}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{events.map((event) => (
						<EventCard key={event.eventId} event={event} isAdminView={isAdmin} />
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious 
									href={currentPage > 1 ? `/admin/events?page=${currentPage - 1}&search=${searchQuery}` : '#'}
									className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
									size="default"
								/>
							</PaginationItem>
							
							{Array.from({ length: totalPages }, (_, i) => {
								const pageNum = i + 1;
								const pageUrl = `/admin/events?page=${pageNum}&search=${searchQuery}`;
								// Show first page, last page, current page, and pages around current
								if (
									pageNum === 1 ||
									pageNum === totalPages ||
									(pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
								) {
									return (
										<PaginationItem key={pageNum}>
											<PaginationLink
												href={pageUrl}
												isActive={currentPage === pageNum}
												size="default"
											>
												{pageNum}
											</PaginationLink>
										</PaginationItem>
									);
								} else if (
									pageNum === currentPage - 2 ||
									pageNum === currentPage + 2
								) {
									return <PaginationEllipsis key={pageNum} />;
								}
								return null;
							})}

							<PaginationItem>
								<PaginationNext 
									href={currentPage < totalPages ? `/admin/events?page=${currentPage + 1}&search=${searchQuery}` : '#'}
									className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
									size="default"
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
					
					<p className="text-center text-sm text-muted-foreground mt-2">
						Showing {events.length} of {totalCount} events
					</p>
				</div>
			)}
		</>
	);
}
