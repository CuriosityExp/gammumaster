"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrManager } from "@/components/admin/QrManager";
import { QrCode } from "lucide-react";

interface ClickableQRIdentifierProps {
  identifier: string;
  userData: any;
  isFacilitator: boolean;
}

export function ClickableQRIdentifier({ identifier, userData, isFacilitator }: ClickableQRIdentifierProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="font-mono text-xs p-0 h-auto text-left justify-start">
          <QrCode className="h-3 w-3 mr-1" />
          {identifier}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <QrManager admin={userData} isFacilitator={isFacilitator} />
      </DialogContent>
    </Dialog>
  );
}