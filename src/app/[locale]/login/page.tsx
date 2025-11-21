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
      redirect(`/${locale}/dashboard/profile`);
    }
  }

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <main className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-blue-400 via-purple-500 via-pink-500 via-red-400 via-yellow-400 via-green-400 to-blue-400 bg-[length:400%_400%] animate-[gradient-shift_8s_ease_infinite] dark:from-blue-900/50 dark:via-purple-900/50 dark:via-pink-900/50 dark:via-red-900/50 dark:via-yellow-900/50 dark:via-green-900/50 dark:to-blue-900/50">
        <UserLoginForm />
      </main>
    </>
  );
}