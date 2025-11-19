// src/components/admin/QrManager.tsx
"use client";

import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { regenerateAdminQrCode } from "@/app/[locale]/admin/account/actions";
import { toast } from "sonner";
import type { Admin } from "@/generated/prisma";

interface QrManagerProps {
  readonly admin: Admin;
}

export function QrManager({ admin }: QrManagerProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const padding = 20; // Example padding in pixels
      const originalSize = canvas.width;
      const newSize = originalSize + padding * 2;

      // Create a new temporary canvas for the download
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newSize;
      tempCanvas.height = newSize;
      const ctx = tempCanvas.getContext('2d');

      if (ctx) {
        // Draw white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, newSize, newSize);
        
        // Draw the existing QR code onto the new canvas with padding
        ctx.drawImage(canvas, padding, padding, originalSize, originalSize);

        // Download the new canvas content
        const url = tempCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `admin-qrcode-${admin.email}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleRegenerate = async () => {
    toast.info("Generating new QR Code...");
    const result = await regenerateAdminQrCode(admin.adminId);
    if (result.success) {
      toast.success(result.success);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin QR Code</CardTitle>
        <CardDescription>
          Use this QR Code to log in to the admin dashboard. Keep it safe.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {/* The displayed QR code can retain its existing padding/styling */}
        <div ref={qrRef} className="p-4 bg-white rounded-lg border">
          <QRCodeCanvas
            value={admin.qrCodeIdentifier}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"} // High error correction
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={handleDownload}>Download PNG</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Regenerate</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new QR Code. Your old QR Code will no longer work. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerate}>
                  Yes, Regenerate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
