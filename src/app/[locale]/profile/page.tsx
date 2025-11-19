// src/app/profile/page.tsx

import { redirect } from "@/i18n/routing";

export default async function ProfilePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Redirect to new dashboard profile page
  redirect({ href: '/dashboard/profile', locale });
}