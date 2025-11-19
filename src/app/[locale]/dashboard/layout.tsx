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
        {/* User Info Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.userId}`} />
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">💎 {user.points.toLocaleString()}</p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
        
        {/* Navigation Tabs */}
        <div className="px-2 py-2">
          <DashboardNav />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-[260px] lg:border-r lg:bg-white lg:flex-col">
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
      </aside>

      {/* Main Content */}
      <main className="pt-[132px] lg:pt-0 lg:ml-[260px] min-h-screen">
        <div className="container mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
