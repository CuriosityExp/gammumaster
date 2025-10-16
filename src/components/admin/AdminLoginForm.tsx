// src/components/admin/AdminLoginForm.tsx
"use client";

import { useState } from "react";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminLoginForm() {
  const router = useRouter();
  // Add explicit types for state
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const handleSignIn = async (qrIdentifier: IDetectedBarcode[]): Promise<void> => {
    // Prevent multiple sign-in attempts from a single scan
    if (!isScanning) return;
    setIsScanning(false);

    const { rawValue } = qrIdentifier[0];

    toast.info("QR Code detected. Logging in...");

    const res = await signIn("admin-credentials", { qrCodeIdentifier : rawValue, redirect: false });
    if (res?.ok) {
      toast.success("Login Successful! Redirecting...");
      // Stop scanning on success by not re-enabling it
      router.push("/admin/prizes");
    } else {
      toast.error("Login Failed: Invalid QR Code.");
      setError("Invalid QR Code. Please scan again.");
      // Allow scanning again after a delay
      setTimeout(() => {
        setIsScanning(true);
        setError("");
      }, 3000);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2x  l">Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">
          Scan your Admin QR code.
        </p>
        <div className="w-full rounded-lg overflow-hidden border">
          <Scanner
            // Add explicit types for the handler parameters
            onScan={(result: IDetectedBarcode[]) => handleSignIn(result)}
            onError={(error: unknown) => console.log(`Error: `, error)}
          />
        </div>
        {error && (
          <p className="text-center text-destructive mt-4 font-semibold">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}