"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useTranslations, useLocale } from "next-intl";
import { QrCode, Camera, XCircle, SwitchCamera } from "lucide-react";

export function UserLoginForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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
      router.push(`/${locale}/dashboard/profile`);
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
    <Card className="w-full max-w-2xl mx-auto border-2 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="!bg-gradient-to-r !from-blue-500 !to-indigo-600 text-white border-b-0 p-2">
        <CardTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
          <QrCode className="h-8 w-8" />
          {t('userLogin')}
        </CardTitle>
        <CardDescription className="text-center text-blue-100">
          {t('scanUserQR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="relative w-full h-[480px] rounded-xl overflow-hidden border-4 border-blue-500/30 shadow-inner bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 pointer-events-none z-10 rounded-xl" />
          <Scanner
            onScan={handleSignIn}
            onError={(error: unknown) => {
              if (error instanceof Error) {
                console.error(`QR Scanner Error: ${error.message}`);
              }
            }}
            constraints={{
              facingMode: facingMode,
            }}
          />
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/90 dark:bg-black/90 rounded-full p-2 shadow-lg">
              <Camera className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            {t('positionQR')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('qrLightingTip')}
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => setFacingMode(facingMode === "user" ? "environment" : "user")}
            variant="outline"
            size="sm"
            className="bg-white/80 dark:bg-black/80 hover:bg-white dark:hover:bg-black border-blue-200 dark:border-blue-800"
          >
            <SwitchCamera className="mr-2 h-4 w-4" />
            {facingMode === "user" ? "Back Camera" : "Front Camera"}
          </Button>
        </div>

        {error && (
          <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300 font-semibold flex items-center justify-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}