// src/app/admin/layout.tsx

import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AccountDropdown } from "@/components/admin/AccountDropdown";

const prisma = new PrismaClient();

async function getAdminData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  if (session.user.role === "admin") {
    const admin = await prisma.admin.findUnique({
      where: { adminId: session.user.id },
    });
    return { type: "admin" as const, data: admin };
  }

  if (session.user.role === "facilitator") {
    const facilitator = await prisma.userFacilitator.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });
    return { type: "facilitator" as const, data: facilitator };
  }

  return null;
}

export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const adminData = await getAdminData();

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between p-8">
          <Link href="/admin" className="hover:underline">
            <h2 className="text-lg font-semibold">
              {adminData?.type === "facilitator" ? "Facilitator" : "Admin"} Dashboard
            </h2>
          </Link>
          {adminData && (
            <AccountDropdown
              email={adminData.type === "admin" ? adminData.data?.email : adminData.data?.user.email}
              availablePoints={adminData.data?.availablePointsToGrant}
              role={adminData.type}
            />
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}