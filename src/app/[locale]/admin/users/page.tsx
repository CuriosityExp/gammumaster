// src/app/admin/users/page.tsx
import { AddPointsDialog } from "@/components/admin/AddPointsDialog";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { EditPointsDialog } from "@/components/admin/EditPointsDialog";
import { DeleteUserAlert } from "@/components/admin/DeleteUserAlert";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import { SearchInput } from "@/components/admin/SearchInput";
import { TableSkeleton } from "@/components/admin/TableSkeleton";
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
  params: paramsPromise,
}: Readonly<{
  searchParams: Promise<{ search?: string; page?: string }>;
  params: Promise<{ locale: string }>;
}>) {
  const [searchParamsResolved, { locale }] = await Promise.all([searchParams, paramsPromise]);
  const searchQuery = searchParamsResolved.search || "";
  const currentPage = Number(searchParamsResolved.page) || 1;
  const t = await getTranslations('users');

  const granterData = await getGranterData();

  if (!granterData) {
    redirect(`/${locale}/admin/login`);
  }

  const availablePoints = granterData.data?.availablePointsToGrant || 0;
  const isAdmin = granterData.role === "admin";

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground ml-15">
            {t('availablePoints', { points: availablePoints.toLocaleString() })}
          </p>
        </div>
        <CreateUserDialog />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchInput 
          placeholder={t('searchPlaceholder')}
          basePath={`/${locale}/admin/users`}
        />
      </div>

      <Suspense key={`${searchQuery}-${currentPage}`} fallback={<TableSkeleton rows={10} columns={4} />}>
        <UsersTable 
          searchQuery={searchQuery} 
          currentPage={currentPage}
          isAdmin={isAdmin}
          availablePoints={availablePoints}
          granterRole={granterData.role}
          locale={locale}
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
  locale,
}: Readonly<{
  searchQuery: string;
  currentPage: number;
  isAdmin: boolean;
  availablePoints: number;
  granterRole: "admin" | "facilitator";
  locale: string;
}>) {
  const { users, totalCount, totalPages } = await getUsers(searchQuery, currentPage);
  const t = await getTranslations('users');

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead className="text-right">{t('points')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? t('noResults') : t('noUsers')}
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
                  href={currentPage > 1 ? `/${locale}/admin/users?page=${currentPage - 1}&search=${searchQuery}` : '#'}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  size="default"
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const pageUrl = `/${locale}/admin/users?page=${pageNum}&search=${searchQuery}`;
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
                  href={currentPage < totalPages ? `/${locale}/admin/users?page=${currentPage + 1}&search=${searchQuery}` : '#'}
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