// src/app/[locale]/dashboard/layout.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/i18n/routing";
import { PrismaClient } from "@/generated/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      name: true,
      email: true,
      points: true,
    },
  });
  return user;
}

export default async function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations('dashboard');

  // Protect dashboard - only regular users can access
  if (!session?.user || session.user.role !== 'user') {
    redirect({ href: '/login', locale });
  }

  // Get user data
  const user = await getUserData(session.user.id);
  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.userId}`} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">💎 {user.points.toLocaleString()} {t('points')}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-0">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed top-0 left-0 h-screen w-[260px] border-r bg-white">
          <div className="flex flex-col h-full">
            {/* User Info */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.userId}`} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-2 rounded-lg">
                <span className="text-xs font-medium">{t('totalPoints')}</span>
                <span className="text-lg font-bold">💎 {user.points.toLocaleString()}</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 overflow-y-auto">
              <DashboardNav />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t space-y-2">
              <LanguageSwitcher />
              <SignOutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-[260px] pt-20 lg:pt-0">
          <div className="container mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="px-4 py-3">
          <DashboardNav />
        </div>
      </div>
    </div>
  );
}
