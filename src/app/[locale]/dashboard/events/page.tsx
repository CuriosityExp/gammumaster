// src/app/[locale]/dashboard/events/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getUserEvents } from "./actions";
import { EventHistoryCard } from "@/components/dashboard/EventHistoryCard";
import { SearchInput } from "@/components/admin/SearchInput";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Suspense } from "react";

function EventsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

async function EventsGrid({
  userId,
  currentPage,
  searchQuery,
  locale,
}: {
  userId: string;
  currentPage: number;
  searchQuery: string;
  locale: string;
}) {
  const { events, totalCount, totalPages } = await getUserEvents(userId, currentPage, searchQuery);
  const t = await getTranslations('dashboard.events');

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          {searchQuery ? t('noResults') : t('noEvents')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventHistoryCard key={event.eventId} event={event} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/${locale}/dashboard/events?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/${locale}/dashboard/events?page=${pageNum}&search=${searchQuery}`}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  href={currentPage < totalPages ? `/${locale}/dashboard/events?page=${currentPage + 1}&search=${searchQuery}` : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t('totalEvents', { count: totalCount })}
          </p>
        </div>
      )}
    </>
  );
}

export default async function EventHistoryPage({
  searchParams,
  params,
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}>) {
  const [searchParamsResolved, { locale }] = await Promise.all([searchParams, params]);
  const session = await getServerSession(authOptions);
  const t = await getTranslations('dashboard.events');

  if (!session?.user || session.user.role !== 'user') {
    redirect({ href: '/login', locale });
  }

  const searchQuery = searchParamsResolved.search || "";
  const currentPage = Number(searchParamsResolved.page) || 1;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="mb-6">
        <SearchInput 
          placeholder={t('searchPlaceholder')}
          basePath={`/${locale}/dashboard/events`}
        />
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<EventsGridSkeleton />}>
        <EventsGrid 
          userId={session.user.id}
          currentPage={currentPage}
          searchQuery={searchQuery}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
