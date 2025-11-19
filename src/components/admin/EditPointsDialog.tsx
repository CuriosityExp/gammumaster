// src/components/admin/EditPointsDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { editUserPoints } from "@/app/[locale]/admin/users/actions";
import { toast } from "sonner";
import { useState } from "react";
import { Coins } from "lucide-react";

interface EditPointsDialogProps {
  readonly userId: string;
  readonly userName: string | null;
  readonly currentPoints: number;
}

export function EditPointsDialog({ userId, userName, currentPoints }: EditPointsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await editUserPoints(userId, formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else if (result.errors) {
        toast.error(JSON.stringify(result.errors));
      } else {
        toast.error(result.message || "Failed to edit points");
      }
    } catch (error) {
      console.error("Error editing points:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Coins className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Points for {userName}</DialogTitle>
          <DialogDescription>
            Set the exact point value for this user. Current points: {currentPoints.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points *
              </Label>
              <Input
                id="points"
                name="points"
                type="number"
                required
                defaultValue={currentPoints}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Optional reason for this change"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Points"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

