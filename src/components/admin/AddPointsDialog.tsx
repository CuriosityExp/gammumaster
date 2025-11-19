// src/components/admin/AddPointsDialog.tsx
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { grantPoints } from "@/app/[locale]/admin/users/actions";
import { toast } from "sonner"; 
import { useRef, useState } from "react";

interface AddPointsDialogProps {
  userId: string;
  userName: string | null;
  granterRole: "admin" | "facilitator";
  availablePoints: number;
}

export function AddPointsDialog({ userId, userName, granterRole, availablePoints }: AddPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const grantPointsWithId = grantPoints.bind(null, userId);

  const handleSubmit = async (formData: FormData) => {
    const result = await grantPoints(userId, formData);

    if (result.success) {
      toast.success(result.message); // Show success toast
      formRef.current?.reset();
      setOpen(false); // Close the dialog on success
    } else {
      if (result.errors) {
        toast.error(JSON.stringify(result.errors));
      } else {
        toast.error(result.message || "Failed to grant points"); // Show error toast
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Points</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant Points to {userName}</DialogTitle>
          <DialogDescription>
            {granterRole === "facilitator" 
              ? `Enter the number of points to grant. This will be deducted from your available balance (${availablePoints.toLocaleString()} points).`
              : "Enter the number of points to grant. This will be deducted from your available points pool."
            }
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={async (formData) => {
            await handleSubmit(formData);
            formRef.current?.reset();
            // We would add proper success/error handling here
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input
                id="points"
                name="points"
                type="number"
                required
                min="1"
                max={availablePoints}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Reason
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="(Optional)"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Confirm Grant</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

