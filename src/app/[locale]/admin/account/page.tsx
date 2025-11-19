import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { QrManager } from "@/components/admin/QrManager";

const prisma = new PrismaClient();

async function getAdmin(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { adminId },
  });
  return admin;
}

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions);

  // Protect the page: if no session or user ID, redirect to login
  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  const admin = await getAdmin(session.user.id);

  if (!admin) {
    return (
      <div className="container mx-auto p-8">
        <p>Error: Could not find your admin account. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Account</h1>
      </div>
      <QrManager admin={admin} />
    </div>
  );
}