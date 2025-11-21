// src/components/admin/EditAccountDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAdminAccount, updateFacilitatorAccount } from "@/app/[locale]/admin/account/actions";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

interface EditAccountDialogProps {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  role: "admin" | "facilitator";
}

export function EditAccountDialog({ userId, userName, userEmail, role }: EditAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('admin');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = role === "admin" 
        ? await updateAdminAccount(userId, formData)
        : await updateFacilitatorAccount(userId, formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message || "Failed to update account");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 transition-colors">
          <Pencil className="h-4 w-4 mr-2" />
          {t('updateData')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('updateAccount')}</DialogTitle>
          <DialogDescription>
            {t('updateAccountDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('nameRequired')}
              </Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={userName || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                {t('emailLabel')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userEmail || ""}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('updating') : t('updateAccountButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}