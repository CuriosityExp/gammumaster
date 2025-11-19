import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function UserLoginPage({
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
    <main className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <UserLoginForm />
    </main>
  );
}