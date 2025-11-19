// src/app/admin/login/page.tsx

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLoginPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  // If user is already logged in, redirect to appropriate dashboard
  if (session?.user) {
    if (session.user.role === "admin" || session.user.role === "facilitator") {
      redirect(`/${locale}/admin`);
    }
    if (session.user.role === "user") {
      redirect(`/${locale}/profile`);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <AdminLoginForm />
    </div>
  );
}