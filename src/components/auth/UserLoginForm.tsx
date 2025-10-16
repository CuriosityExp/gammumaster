"use client";

import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";

export function UserLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleSignIn = async (result: IDetectedBarcode[]): Promise<void> => {
    if (!isScanning) return;
    setIsScanning(false);

    const { rawValue: qrCodeIdentifier } = result[0];

    toast.info("QR Code detected. Logging in...");

    const res = await signIn("user-credentials", { // <-- Use the user provider
      qrCodeIdentifier,
      redirect: false,
    });

    if (res?.ok) {
      toast.success("Login Successful!");
      router.push("/profile"); // Redirect to the user profile page
    } else {
      toast.error("Login Failed: Invalid QR Code.");
      setError("Invalid QR Code. Please try again.");
      setTimeout(() => {
        setIsScanning(true);
        setError("");
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-bold">Welcome!</CardTitle>
        <CardDescription className="text-center">
          Scan your personal QR code to view your points and redeem prizes.
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