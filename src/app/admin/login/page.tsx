// src/app/admin/login/page.tsx

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <AdminLoginForm />
    </div>
  );
}