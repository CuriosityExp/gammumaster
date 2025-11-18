// src/app/admin/facilitators/page.tsx
import { CreateFacilitatorDialog } from "@/components/admin/CreateFacilitatorDialog";
import { EditFacilitatorDialog } from "@/components/admin/EditFacilitatorDialog";
import { DeleteFacilitatorAlert } from "@/components/admin/DeleteFacilitatorAlert";
import { FacilitatorDetailsDialog } from "@/components/admin/FacilitatorDetailsDialog";
import { SearchInput } from "@/components/admin/SearchInput";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
import { Suspense } from "react";
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
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
}>) {
  const session = await getServerSession(authOptions);

  // Only admins can access this page
  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const searchQuery = params.search || "";
  const currentPage = Number(params.page) || 1;

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Manage Facilitators</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage facilitator accounts with limited admin privileges
          </p>
        </div>
        <CreateFacilitatorDialog />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput 
          placeholder="Search by name or email..." 
          basePath="/admin/facilitators"
        />
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<TableSkeleton rows={10} columns={5} />}>
        <FacilitatorsTable searchQuery={searchQuery} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}

async function FacilitatorsTable({ 
  searchQuery, 
  currentPage 
}: Readonly<{
  searchQuery: string;
  currentPage: number;
}>) {
  const { facilitators, totalCount, totalPages } = await getFacilitators(searchQuery, currentPage);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Available Points</TableHead>
              <TableHead className="text-right">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facilitators.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchQuery ? "No facilitators found matching your search" : "No facilitators yet. Create one to get started."}
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
                  href={currentPage > 1 ? `/admin/facilitators?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const pageUrl = `/admin/facilitators?page=${pageNum}&search=${searchQuery}`;
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
                  href={currentPage < totalPages ? `/admin/facilitators?page=${currentPage + 1}&search=${searchQuery}` : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {facilitators.length} of {totalCount} facilitators
          </p>
        </div>
      )}
    </>
  );
}
