// src/app/admin/users/page.tsx
import { AddPointsDialog } from "@/components/admin/AddPointsDialog";
import { CreateUserDialog } from "@/components/admin/CreateUserDialog";
import { EditUserDialog } from "@/components/admin/EditUserDialog";
import { EditPointsDialog } from "@/components/admin/EditPointsDialog";
import { DeleteUserAlert } from "@/components/admin/DeleteUserAlert";
import { UserDetailsDialog } from "@/components/admin/UserDetailsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrismaClient } from '@/generated/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

async function getUsers() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  return users;
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

export default async function AdminUsersPage() {
  const granterData = await getGranterData();

  if (!granterData) {
    redirect("/admin/login");
  }

  const users = await getUsers();
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
            {users.map((user) => (
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
                      granterRole={granterData.role}
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}