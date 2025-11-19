"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useTranslations, useLocale } from "next-intl";

export function UserLoginForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleSignIn = async (result: IDetectedBarcode[]): Promise<void> => {
    if (!isScanning) return;
    setIsScanning(false);

    const { rawValue: qrCodeIdentifier } = result[0];

    toast.info(t('qrDetected'));

    const res = await signIn("user-credentials", { // <-- Use the user provider
      qrCodeIdentifier,
      redirect: false,
    });

    if (res?.ok) {
      toast.success(t('loginSuccess'));
      router.push(`/${locale}/profile`); // Redirect to the user profile page
    } else {
      toast.error(t('loginFailed'));
      setError(t('invalidQR'));
      setTimeout(() => {
        setIsScanning(true);
        setError("");
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-bold">{t('userLogin')}</CardTitle>
        <CardDescription className="text-center">
          {t('scanUserQR')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full rounded-lg overflow-hidden border">
          <Scanner
            onScan={handleSignIn}
            onError={(error: unknown) => {
              if (error instanceof Error) {
                console.error(`QR Scanner Error: ${error.message}`);
              }
            }}
          />
        </div>
        {error && (
          <p className="text-center text-destructive mt-4 font-semibold">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}