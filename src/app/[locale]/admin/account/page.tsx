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

async function getFacilitatorUser(facilitatorId: string) {
  const facilitator = await prisma.userFacilitator.findUnique({
    where: { facilitatorId },
    include: {
      user: true,
    },
  });
  return facilitator?.user;
}

export default async function AdminAccountPage({
  params
}: {
  readonly params: Promise<{ readonly locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // Protect the page: if no session or user ID, redirect to login
  if (!session?.user?.id) {
    redirect({ href: "/admin/login", locale });
  }

  // Allow both admins and facilitators to access this page
  if (session.user.role !== "admin" && session.user.role !== "facilitator") {
    redirect({ href: "/admin/login", locale });
  }

  // Get user data based on role
  let userData: any;
  if (session.user.role === "facilitator") {
    userData = await getFacilitatorUser(session.user.facilitatorId);
  } else {
    userData = await getAdmin(session.user.id);
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-8">
        <p>Error: Could not find your account. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Account</h1>
      </div>
      <QrManager admin={userData} isFacilitator={session.user.role === "facilitator"} />
    </div>
  );
}