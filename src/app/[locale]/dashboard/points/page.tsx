// src/app/[locale]/dashboard/points/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { getPointTransactions, getPointSummary } from "./actions";
import { PointSummaryCard } from "@/components/dashboard/PointSummaryCard";
import { PointTransactionItem } from "@/components/dashboard/PointTransactionItem";
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
import Link from "next/link";

function TransactionsListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

async function TransactionsList({
  userId,
  currentPage,
  filterType,
  locale,
}: Readonly<{
  userId: string;
  currentPage: number;
  filterType?: TransactionType;
  locale: string;
}>) {
  const { transactions, totalCount, totalPages } = await getPointTransactions(
    userId,
    currentPage,
    filterType
  );
  const t = await getTranslations('dashboard.points');

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-muted-foreground">
          {t('noTransactions')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        {transactions.map((transaction) => (
          <PointTransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/${locale}/dashboard/points?page=${currentPage - 1}${filterType ? `&type=${filterType}` : ''}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
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
                        href={`/${locale}/dashboard/points?page=${pageNum}${typeParam}`}
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
                {(() => {
                  const typeParam = filterType ? `&type=${filterType}` : '';
                  const nextHref = currentPage < totalPages 
                    ? `/${locale}/dashboard/points?page=${currentPage + 1}${typeParam}`
                    : '#';
                  return (
                    <PaginationNext 
                      href={nextHref}
                      className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  );
                })()}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Showing {transactions.length} of {totalCount} transactions
          </p>
        </div>
      )}
    </>
  );
}

export default async function PointHistoryPage({
  searchParams,
  params,
}: Readonly<{
  searchParams: Promise<{ page?: string; type?: string }>;
  params: Promise<{ locale: string }>;
}>) {
  const [searchParamsResolved, { locale }] = await Promise.all([searchParams, params]);
  const session = await getServerSession(authOptions);
  const t = await getTranslations('dashboard.points');

  if (!session?.user || session.user.role !== 'user') {
    redirect({ href: '/login', locale });
  }

  const currentPage = Number(searchParamsResolved.page) || 1;
  const filterType = searchParamsResolved.type as TransactionType | undefined;

  const summary = await getPointSummary(session.user.id);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <PointSummaryCard summary={summary} />

      <div className="mb-4 flex gap-2">
        <Link href={`/${locale}/dashboard/points`}>
          <button className={`px-4 py-2 rounded-lg border ${filterType ? 'bg-white' : 'bg-primary text-primary-foreground'}`}>
            {t('allTypes')}
          </button>
        </Link>
        <Link href={`/${locale}/dashboard/points?type=ADMIN_GRANT`}>
          <button className={`px-4 py-2 rounded-lg border ${filterType === 'ADMIN_GRANT' ? 'bg-primary text-primary-foreground' : 'bg-white'}`}>
            {t('transactionType.ADMIN_GRANT')}
          </button>
        </Link>
        <Link href={`/${locale}/dashboard/points?type=EVENT_TOPUP`}>
          <button className={`px-4 py-2 rounded-lg border ${filterType === 'EVENT_TOPUP' ? 'bg-primary text-primary-foreground' : 'bg-white'}`}>
            {t('transactionType.EVENT_TOPUP')}
          </button>
        </Link>
        <Link href={`/${locale}/dashboard/points?type=PRIZE_REDEEM`}>
          <button className={`px-4 py-2 rounded-lg border ${filterType === 'PRIZE_REDEEM' ? 'bg-primary text-primary-foreground' : 'bg-white'}`}>
            {t('transactionType.PRIZE_REDEEM')}
          </button>
        </Link>
      </div>

      <Suspense key={`${currentPage}-${filterType}`} fallback={<TransactionsListSkeleton />}>
        <TransactionsList 
          userId={session.user.id}
          currentPage={currentPage}
          filterType={filterType}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
