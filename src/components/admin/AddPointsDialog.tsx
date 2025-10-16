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
import { grantPoints } from "@/app/admin/users/actions";
import { toast } from "sonner"; 
import { useRef, useState } from "react";

interface AddPointsDialogProps {
  userId: string;
  userName: string | null;
}

export function AddPointsDialog({ userId, userName }: AddPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const grantPointsWithId = grantPoints.bind(null, userId);

  const handleSubmit = async (formData: FormData) => {
    const result = await grantPoints(userId, formData);

    if (result.message?.includes("Error") || result.message?.includes("failed")) {
      toast.error(result.message); // 2. Show error toast
    } else {
      toast.success(result.message); // 3. Show success toast
      formRef.current?.reset();
      setOpen(false); // Close the dialog on success
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">Add Points</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Grant Points to {userName}</DialogTitle>
          <DialogDescription>
            Enter the number of points to grant. This will be deducted from your
            available points pool.
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
