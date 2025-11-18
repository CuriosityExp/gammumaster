// src/app/admin/users/page.tsx
import { AddPointsDialog } from "@/components/admin/AddPointsDialog";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { EditPointsDialog } from "@/components/admin/EditPointsDialog";
import { DeleteUserAlert } from "@/components/admin/DeleteUserAlert";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { SearchInput } from "@/components/admin/SearchInput";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
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
import { Suspense } from "react";

const prisma = new PrismaClient();

const ITEMS_PER_PAGE = 10;

async function getUsers(searchQuery: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  
  const where = {
    deletedAt: null,
    ...(searchQuery ? {
      OR: [
        { name: { contains: searchQuery } },
        { email: { contains: searchQuery } },
      ],
    } : {}),
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, totalCount, totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE) };
}

async function getGranterData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  if (session.user.role === "admin") {
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });
    return { type: "admin" as const, data: admin, role: session.user.role };
  }

  if (session.user.role === "facilitator") {
    const facilitator = await prisma.userFacilitator.findUnique({
      where: { userId: session.user.id },
    });
    return { type: "facilitator" as const, data: facilitator, role: session.user.role };
  }

  return null;
}

export default async function AdminUsersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
}>) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const currentPage = Number(params.page) || 1;

  const granterData = await getGranterData();

  if (!granterData) {
    redirect("/admin/login");
  }

  const availablePoints = granterData.data?.availablePointsToGrant || 0;
  const isAdmin = granterData.role === "admin";

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-2">
            Available points to grant: <span className="font-semibold">{availablePoints.toLocaleString()}</span>
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput 
          placeholder="Search by name or email..." 
          basePath="/admin/users"
        />
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<TableSkeleton rows={10} columns={4} />}>
        <UsersTable 
          searchQuery={searchQuery} 
          currentPage={currentPage}
          isAdmin={isAdmin}
          availablePoints={availablePoints}
          granterRole={granterData.role}
        />
      </Suspense>
    </div>
  );
}

async function UsersTable({ 
  searchQuery, 
  currentPage,
  isAdmin,
  availablePoints,
  granterRole,
}: Readonly<{
  searchQuery: string;
  currentPage: number;
  isAdmin: boolean;
  availablePoints: number;
  granterRole: "admin" | "facilitator";
}>) {
  const { users, totalCount, totalPages } = await getUsers(searchQuery, currentPage);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No users yet"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">{user.points.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <UserDetailsDialog 
                        userId={user.userId}
                        userName={user.name}
                      />
                      <EditUserDialog 
                        userId={user.userId}
                        userName={user.name}
                        userEmail={user.email}
                      />
                      {isAdmin && (
                        <EditPointsDialog 
                          userId={user.userId}
                          userName={user.name}
                          currentPoints={user.points}
                        />
                      )}
                      <AddPointsDialog 
                        userId={user.userId} 
                        userName={user.name}
                        granterRole={granterRole}
                        availablePoints={availablePoints}
                      />
                      {isAdmin && (
                        <DeleteUserAlert 
                          userId={user.userId}
                          userName={user.name}
                        />
                      )}
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
                  href={currentPage > 1 ? `/admin/users?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const pageUrl = `/admin/users?page=${pageNum}&search=${searchQuery}`;
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
                  href={currentPage < totalPages ? `/admin/users?page=${currentPage + 1}&search=${searchQuery}` : '#'}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {users.length} of {totalCount} users
          </p>
        </div>
      )}
    </>
  );
}