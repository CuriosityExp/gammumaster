import { getAllEvents } from "./actions";
import { CreateEventDialog } from "@/components/event/CreateEventDialog";
import { EventCard } from "@/components/event/EventCard";
import { SearchInput } from "@/components/admin/SearchInput";
import { CardGridSkeleton } from "@/components/admin/CardGridSkeleton";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
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
	params,
}: Readonly<{
	searchParams: Promise<{ search?: string; page?: string }>;
	params: Promise<{ locale: string }>;
}>) {
	const { locale } = await params;
	const session = await getServerSession(authOptions);

	if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
		redirect(`/${locale}/admin/login`);
	}

	const isAdmin = session.user.role === "admin";
	const isFacilitator = session.user.role === "facilitator";

	const searchParamsResolved = await searchParams;
	const searchQuery = searchParamsResolved.search || "";
	const currentPage = Number(searchParamsResolved.page) || 1;
	const t = await getTranslations('events');

	return (
		<div className="container mx-auto p-6">
			<div className="flex justify-between items-center mb-6">
				<div>
					<div className="inline-flex items-center gap-3 mb-2">
						<div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
						<div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
								{isFacilitator ? t('scannerAccess') : t('title')}
							</h1>
						</div>
					</div>
					<p className="text-muted-foreground ml-15">
						{isFacilitator 
							? t('viewEventsDesc')
							: t('manageEventsDesc')
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
						placeholder={t('searchPlaceholder')}
						basePath={`/${locale}/admin/events`}
					/>
				</div>
			</div>

			<Suspense key={`${searchQuery}-${currentPage}`} fallback={<CardGridSkeleton count={9} />}>
				<EventsGrid 
					searchQuery={searchQuery} 
					currentPage={currentPage}
					isAdmin={isAdmin}
					isFacilitator={isFacilitator}
					locale={locale}
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
	locale,
}: Readonly<{
	searchQuery: string;
	currentPage: number;
	isAdmin: boolean;
	isFacilitator: boolean;
	locale: string;
}>) {
	const result = await getAllEvents(searchQuery, currentPage);
	const t = await getTranslations('events');

	// Handle both paginated and non-paginated responses
	const events = Array.isArray(result) ? result : result.events;
	const totalCount = Array.isArray(result) ? result.length : result.totalCount;
	const totalPages = Array.isArray(result) ? 1 : result.totalPages;

	// Determine empty state message
	const getEmptyMessage = () => {
		if (searchQuery) return t('noResults');
		if (isFacilitator) return t('noEventsAvailable');
		return t('noEvents');
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
									href={currentPage > 1 ? `/${locale}/admin/events?page=${currentPage - 1}&search=${searchQuery}` : '#'}
									className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
									size="default"
								/>
							</PaginationItem>
							
							{Array.from({ length: totalPages }, (_, i) => {
								const pageNum = i + 1;
								const pageUrl = `/${locale}/admin/events?page=${pageNum}&search=${searchQuery}`;
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
									href={currentPage < totalPages ? `/${locale}/admin/events?page=${currentPage + 1}&search=${searchQuery}` : '#'}
									className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
									size="default"
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
					
					<p className="text-center text-sm text-muted-foreground mt-2">
						{t('showing', { count: events.length, total: totalCount })}
					</p>
				</div>
			)}
		</>
	);
}
