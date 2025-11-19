// src/app/[locale]/dashboard/profile/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";
import { PrismaClient } from "@/generated/prisma";
import { UserProfileCard } from "@/components/user/UserProfileCard";
import { getTranslations } from "next-intl/server";

const prisma = new PrismaClient();

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
  });
  return user;
}

export default async function ProfilePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('profile');

  // Protection handled by layout, but double-check
  if (!session?.user || session.user.role !== 'user') {
    redirect({ href: '/login', locale });
  }

  const user = await getUserData(session.user.id);
  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>
      
      <UserProfileCard user={user} />
    </div>
  );
}
