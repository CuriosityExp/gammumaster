// src/app/admin/facilitators/page.tsx
import { CreateFacilitatorDialog } from "@/components/facilitators/CreateFacilitatorDialog";
import { EditFacilitatorDialog } from "@/components/facilitators/EditFacilitatorDialog";
import { DeleteFacilitatorAlert } from "@/components/facilitators/DeleteFacilitatorAlert";
import { FacilitatorDetailsDialog } from "@/components/facilitators/FacilitatorDetailsDialog";
import { SearchInput } from "@/components/admin/SearchInput";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PrismaClient } from '@/generated/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 10;

async function getFacilitators(searchQuery: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build WHERE clause
  const where = searchQuery
    ? {
        user: {
          OR: [
            { name: { contains: searchQuery } },
            { email: { contains: searchQuery } },
          ],
        },
      }
    : {};

  const [facilitators, totalCount] = await Promise.all([
    prisma.userFacilitator.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.userFacilitator.count({ where }),
  ]);

  return {
    facilitators,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  };
}

export default async function AdminFacilitatorsPage({
  searchParams,
  params: paramsPromise,
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}>) {
  const [searchParamsResolved, { locale }] = await Promise.all([searchParams, paramsPromise]);
  const session = await getServerSession(authOptions);

  // Only admins can access this page
  if (!session?.user?.email || session.user.role !== "admin") {
    redirect(`/${locale}/admin/login`);
  }

  const searchQuery = searchParamsResolved.search || "";
  const currentPage = Number(searchParamsResolved.page) || 1;
  const t = await getTranslations('facilitators');

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-15">
            {t('description')}
          </p>
        </div>
        <CreateFacilitatorDialog />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput 
          placeholder={t('searchPlaceholder')}
          basePath={`/${locale}/admin/facilitators`}
        />
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<TableSkeleton rows={10} columns={5} />}>
        <FacilitatorsTable searchQuery={searchQuery} currentPage={currentPage} locale={locale} />
      </Suspense>
    </div>
  );
}

async function FacilitatorsTable({ 
  searchQuery, 
  currentPage,
  locale,
}: Readonly<{
  searchQuery: string;
  currentPage: number;
  locale: string;
}>) {
  const { facilitators, totalCount, totalPages } = await getFacilitators(searchQuery, currentPage);
  const t = await getTranslations('facilitators');
  const tCommon = await getTranslations('common');

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{tCommon('name')}</TableHead>
              <TableHead>{tCommon('email')}</TableHead>
              <TableHead className="text-right">{t('availablePoints')}</TableHead>
              <TableHead className="text-right">{t('created')}</TableHead>
              <TableHead className="text-right">{tCommon('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facilitators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchQuery ? t('noResults') : t('noFacilitators')}
                </TableCell>
              </TableRow>
            ) : (
              facilitators.map((facilitator) => (
                <TableRow key={facilitator.facilitatorId}>
                  <TableCell className="font-medium">{facilitator.user.name}</TableCell>
                  <TableCell>{facilitator.user.email}</TableCell>
                  <TableCell className="text-right">
                    {facilitator.availablePointsToGrant.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(facilitator.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <FacilitatorDetailsDialog 
                        facilitatorId={facilitator.facilitatorId}
                        userName={facilitator.user.name}
                      />
                      <EditFacilitatorDialog 
                        facilitatorId={facilitator.facilitatorId}
                        userName={facilitator.user.name}
                        currentPoints={facilitator.availablePointsToGrant}
                      />
                      <DeleteFacilitatorAlert 
                        facilitatorId={facilitator.facilitatorId}
                        userName={facilitator.user.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href={currentPage > 1 ? `/${locale}/admin/facilitators?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const pageUrl = `/${locale}/admin/facilitators?page=${pageNum}&search=${searchQuery}`;
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
                  href={currentPage < totalPages ? `/${locale}/admin/facilitators?page=${currentPage + 1}&search=${searchQuery}` : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-2">
            {tCommon('showing', { count: facilitators.length, total: totalCount })}
          </p>
        </div>
      )}
    </>
  );
}
