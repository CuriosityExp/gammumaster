// src/components/admin/AdminLoginForm.tsx
"use client";

import { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";

export function AdminLoginForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();
  // Add explicit types for state
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);

  const handleSignIn = async (qrIdentifier: IDetectedBarcode[]): Promise<void> => {
    // Prevent multiple sign-in attempts from a single scan
    if (!isScanning) return;
    setIsScanning(false);

    const { rawValue } = qrIdentifier[0];

    toast.info(t('qrDetected'));

    const res = await signIn("admin-credentials", { qrCodeIdentifier : rawValue, redirect: false });
    if (res?.ok) {
      toast.success(t('loginSuccess'));
      // Stop scanning on success by not re-enabling it
      router.replace(`/${locale}/admin`);
    } else {
      toast.error(t('loginFailed'));
      setError(t('invalidQR'));
      // Start countdown and allow scanning again after delay
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsScanning(true);
            setError("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t('adminLogin')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">
          {t('scanAdminQR')}
        </p>
        <div className="w-full rounded-lg overflow-hidden border">
          {!isScanning && countdown > 0 ? (
            <div className="aspect-video flex flex-col items-center justify-center bg-muted p-6">
              <div className="text-6xl font-bold text-destructive mb-4">{countdown}</div>
            </div>
          ) : (
            <Scanner
              // Add explicit types for the handler parameters
              onScan={(result: IDetectedBarcode[]) => handleSignIn(result)}
              onError={(error: unknown) => console.log(`Error: `, error)}
            />
          )}
        </div>
        {error && (
          <p className="text-center text-destructive mt-4 font-semibold">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}