// src/components/user/UserProfileCard.tsx
"use client";

import type { User } from "@/generated/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useTranslations } from "next-intl";
import { EditProfileDialog } from "@/components/dashboard/EditProfileDialog";

interface UserProfileCardProps {
 readonly user: User;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('profile');

  const handleDownload = () => {
    // This is the same download logic from the admin page
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
        const padding = 20;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width + padding * 2;
        tempCanvas.height = canvas.height + padding * 2;
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, padding, padding);
            const url = tempCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `user-qrcode-${user.name || user.userId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4">
          {/* Placeholder for a future user profile image */}
          <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.userId}`} alt={user.name || 'User'} />
          <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{user.name || "Valued User"}</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{t('myPoints')}</p>
          <p className="text-5xl font-bold tracking-tighter">{user.points.toLocaleString()}</p>
        </div>

        <div className="text-center p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">{t('qrCode')}</p>
            <div ref={qrRef} className="p-4 bg-white rounded-md">
                <QRCodeCanvas value={user.qrCodeIdentifier} size={200} />
            </div>
        </div>

        <div className="w-full flex flex-col gap-3">
            <EditProfileDialog user={user} />
            <Button onClick={handleDownload} className="w-full">{t('downloadQR')}</Button>
            <SignOutButton />
        </div>
      </CardContent>
    </Card>
  );
}