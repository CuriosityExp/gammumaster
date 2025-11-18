// src/components/admin/EditFacilitatorDialog.tsx
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
import { updateFacilitator } from "@/app/admin/facilitators/actions";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface EditFacilitatorDialogProps {
  readonly facilitatorId: string;
  readonly userName: string | null;
  readonly currentPoints: number;
}

export function EditFacilitatorDialog({ facilitatorId, userName, currentPoints }: EditFacilitatorDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateFacilitator(facilitatorId, formData);

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else if (result.errors) {
        toast.error(JSON.stringify(result.errors));
      } else {
        toast.error(result.message || "Failed to update facilitator");
      }
    } catch (error) {
      console.error("Error updating facilitator:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Facilitator: {userName}</DialogTitle>
          <DialogDescription>
            Update the available points for this facilitator.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availablePointsToGrant" className="text-right">
                Points *
              </Label>
              <Input
                id="availablePointsToGrant"
                name="availablePointsToGrant"
                type="number"
                required
                min="0"
                defaultValue={currentPoints}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Facilitator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
