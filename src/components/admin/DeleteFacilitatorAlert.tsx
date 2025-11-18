// src/components/admin/DeleteFacilitatorAlert.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteFacilitator } from "@/app/admin/facilitators/actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteFacilitatorAlertProps {
  readonly facilitatorId: string;
  readonly userName: string | null;
}

export function DeleteFacilitatorAlert({ facilitatorId, userName }: DeleteFacilitatorAlertProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteFacilitator(facilitatorId);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Failed to delete facilitator");
      }
    } catch (error) {
      console.error("Error deleting facilitator:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Facilitator</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove facilitator privileges from "{userName}"? 
            This will not delete the user account, only remove their facilitator access.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
