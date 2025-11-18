// src/app/admin/layout.tsx

import { PrismaClient } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link"; // 1. Import the Link component
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

async function getAdminData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const admin = await prisma.admin.findUnique({
    where: { adminId: session.user.id },
  });
  return admin;
}

export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const admin = await getAdminData();

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between p-8">
          <Link href="/admin" className="hover:underline">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </Link>
          {admin && (
            <div className="text-right">
              {/* 2. Add the link here */}
              <Link href="/admin/account" className="text-sm font-medium hover:underline">
                {admin.email}
              </Link>
              <p className="text-sm text-muted-foreground">
                {admin.availablePointsToGrant.toLocaleString()} points remaining
              </p>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}