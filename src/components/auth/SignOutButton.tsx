// src/components/auth/SignOutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";

export function SignOutButton() {
  const t = useTranslations('auth');
  const locale = useLocale();
  
  return (
    <Button 
      variant="outline" 
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
    >
      {t('logout')}
    </Button>
  );
}