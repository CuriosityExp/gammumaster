// src/app/admin/prizes/page.tsx
import { PrismaClient } from "@/generated/prisma";
import { CreatePrizeDialog } from "@/components/admin/CreatePrizeDialog";
import { PrizeCard } from "@/components/admin/PrizeCard";
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

// Initialize Prisma Client
const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 9; // 3x3 grid

// Fetch prizes with search and pagination
async function getPrizes(searchQuery: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build WHERE clause
  const where = {
    isEnabled: true,
    deletedAt: null,
    ...(searchQuery && {
      OR: [
        { name: { contains: searchQuery } },
        { description: { contains: searchQuery } },
      ],
    }),
  };

  const [prizes, totalCount] = await Promise.all([
    prisma.prize.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.prize.count({ where }),
  ]);

  return {
    prizes,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  };
}

export default async function AdminPrizesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
}>) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const currentPage = Number(params.page) || 1;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Prizes</h1>
        <CreatePrizeDialog />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <SearchInput 
            placeholder="Search prizes by name or description..." 
            basePath="/admin/prizes"
          />
        </div>
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<CardGridSkeleton count={9} />}>
        <PrizesGrid searchQuery={searchQuery} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}

async function PrizesGrid({ 
  searchQuery, 
  currentPage 
}: Readonly<{
  searchQuery: string;
  currentPage: number;
}>) {
  const { prizes, totalCount, totalPages } = await getPrizes(searchQuery, currentPage);

  return (
    <>
      {prizes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {searchQuery ? "No prizes found matching your search" : "No prizes found. Add one to get started!"}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <PrizeCard key={prize.prizeId} prize={prize} />
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
                  href={currentPage > 1 ? `/admin/prizes?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const pageUrl = `/admin/prizes?page=${pageNum}&search=${searchQuery}`;
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
                  href={currentPage < totalPages ? `/admin/prizes?page=${currentPage + 1}&search=${searchQuery}` : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {prizes.length} of {totalCount} prizes
          </p>
        </div>
      )}
    </>
  );
}
