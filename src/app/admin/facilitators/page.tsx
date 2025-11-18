// src/app/admin/facilitators/page.tsx
import { CreateFacilitatorDialog } from "@/components/admin/CreateFacilitatorDialog";
import { EditFacilitatorDialog } from "@/components/admin/EditFacilitatorDialog";
import { DeleteFacilitatorAlert } from "@/components/admin/DeleteFacilitatorAlert";
import { FacilitatorDetailsDialog } from "@/components/admin/FacilitatorDetailsDialog";
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

async function getFacilitators() {
  const facilitators = await prisma.userFacilitator.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return facilitators;
}

export default async function AdminFacilitatorsPage() {
  const session = await getServerSession(authOptions);

  // Only admins can access this page
  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const facilitators = await getFacilitators();

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
                  No facilitators yet. Create one to get started.
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
    </div>
  );
}
