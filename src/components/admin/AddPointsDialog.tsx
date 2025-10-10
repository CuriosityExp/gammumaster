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
import { toast } from "sonner"; // We'll add this for notifications later
import { useRef } from "react";

interface AddPointsDialogProps {
  userId: string;
  userName: string | null;
}

export function AddPointsDialog({ userId, userName }: AddPointsDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const grantPointsWithId = grantPoints.bind(null, userId);

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
          action={async (formData) => {
            await grantPointsWithId(formData);
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
