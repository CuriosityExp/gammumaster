// src/components/admin/DeletePrizeAlert.tsx
// src/components/prizes/DeletePrizeAlert.tsx

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
import { deletePrize } from "@/app/admin/prizes/actions";

interface DeletePrizeAlertProps {
  readonly prizeId: string;
  readonly prizeName: string;
}

export function DeletePrizeAlert({
  prizeId,
  prizeName,
}: DeletePrizeAlertProps) {
  // Bind the prizeId to the server action
  const deletePrizeWithId = deletePrize.bind(null, prizeId);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will archive the prize and hide it from all users. You can
            recover it from the database later. Are you sure you want to archive{" "}
            <span className="font-semibold">"{prizeName}"</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form
            action={async (formData) => {
              await deletePrizeWithId();
            }}
          >
            <AlertDialogAction type="submit">Continue</AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
