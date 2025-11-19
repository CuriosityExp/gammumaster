// src/app/[locale]/admin/grant-history/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getFacilitatorGrantHistory, getFacilitatorGrantSummary } from "./actions";
import { GrantSummaryCard } from "@/components/admin/GrantSummaryCard";
import { GrantTransactionItem } from "@/components/admin/GrantTransactionItem";
import { GrantFilterButtons } from "@/components/admin/GrantFilterButtons";
import { TransactionType } from "@/generated/prisma";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Suspense } from "react";

function TransactionsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }, (_, i) => `skeleton-item-${i}`).map((key) => (
        <div key={key} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

async function GrantHistoryList({
  facilitatorId,
  currentPage,
  filterType,
  locale,
}: Readonly<{
  facilitatorId: string;
  currentPage: number;
  filterType?: TransactionType;
  locale: string;
}>) {
  const { transactions, totalCount, totalPages } = await getFacilitatorGrantHistory(
    facilitatorId,
    currentPage,
    filterType
  );
  const t = await getTranslations('admin');

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 rounded-xl border-2 border-dashed border-blue-200 shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('noGrantHistory')}
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {t('grantHistoryEmptyDesc')}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-600 font-medium">Ready to grant points!</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
        {transactions.map((transaction) => (
          <GrantTransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-100">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                {(() => {
                  const typeParam = filterType ? `&type=${filterType}` : '';
                  const prevHref = currentPage > 1
                    ? `/${locale}/admin/grant-history?page=${currentPage - 1}${typeParam}`
                    : '#';
                  return (
                    <PaginationPrevious
                      href={prevHref}
                      className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-blue-100 hover:text-blue-700 border-blue-200'}`}
                    />
                  );
                })()}
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const typeParam = filterType ? `&type=${filterType}` : '';
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/${locale}/admin/grant-history?page=${pageNum}${typeParam}`}
                        isActive={currentPage === pageNum}
                        className={`${currentPage === pageNum ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-md' : 'hover:bg-blue-50 hover:text-blue-600 border-blue-200'}`}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                {(() => {
                  const typeParam = filterType ? `&type=${filterType}` : '';
                  const nextHref = currentPage < totalPages
                    ? `/${locale}/admin/grant-history?page=${currentPage + 1}${typeParam}`
                    : '#';
                  return (
                    <PaginationNext
                      href={nextHref}
                      className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-blue-100 hover:text-blue-700 border-blue-200'}`}
                    />
                  );
                })()}
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="mt-4 text-center">
            <p className="text-sm text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
              Showing {transactions.length} of {totalCount} grant transactions
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default async function FacilitatorGrantHistoryPage({
  searchParams,
  params,
}: Readonly<{
  searchParams: Promise<{ page?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const searchParamsResolved = await searchParams;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('admin');

  if (!session?.user?.role || (session.user.role !== "admin" && session.user.role !== "facilitator")) {
    redirect({ href: '/admin/login', locale });
  }

  const currentPage = Number(searchParamsResolved.page) || 1;
  const filterType = searchParamsResolved.type as TransactionType | undefined;

  // Get facilitator data
  let facilitatorId: string;
  if (session?.user?.role === "facilitator") {
    facilitatorId = session.user.facilitatorId!;
  } else {
    // For admin viewing facilitator history, we'd need to pass facilitator ID
    // For now, redirect to users page
    redirect({ href: '/admin/users', locale });
  }

  if (!facilitatorId) {
    redirect({ href: '/admin/login', locale });
  }

  const summary = await getFacilitatorGrantSummary(facilitatorId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-8 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 min-h-screen">
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
              {t('pointGrantHistory')}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t('viewAllGrantedPoints')}</p>
          </div>
        </div>
      </div>

      <GrantSummaryCard summary={summary} />

      <GrantFilterButtons currentFilter={filterType} locale={locale} />

      <Suspense key={`${currentPage}-${filterType}`} fallback={<TransactionsListSkeleton />}>
        <GrantHistoryList
          facilitatorId={facilitatorId}
          currentPage={currentPage}
          filterType={filterType}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}