// src/app/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { UserProfileCard } from "@/components/user/UserProfileCard";

const prisma = new PrismaClient();

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  return user;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  // 1. Protection: If no session, or if the user is not a 'user', redirect to login.
  if (!session || session.user.role !== 'user') {
    redirect("/login");
  }

  // 2. Data Fetching: Get the full user object from the database.
  const user = await getUserData(session.user.id);
  // Handle the rare case where the user is not in the DB
  if (!user) {
    redirect("/login?error=UserNotFound");
  }

  // 3. Render the UI
  return (
    <main className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <UserProfileCard user={user} />
    </main>
  );
}