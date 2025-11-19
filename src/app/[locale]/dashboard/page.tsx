// src/app/[locale]/dashboard/page.tsx

import { redirect } from "@/i18n/routing";

export default async function DashboardPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Redirect to profile as the default dashboard view
  redirect({ href: '/dashboard/profile', locale });
}
