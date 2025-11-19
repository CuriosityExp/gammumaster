// src/components/admin/EditPrizeDialog.tsx
// src/components/prizes/EditPrizeDialog.tsx

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
import { Textarea } from "@/components/ui/textarea";
import { updatePrize } from "@/app/[locale]/admin/prizes/actions";
import type { Prize } from "@/generated/prisma";
import { useRef } from "react";

interface EditPrizeDialogProps {
 readonly prize: Prize;
}

export function EditPrizeDialog({ prize }: EditPrizeDialogProps) {
  // We bind the prizeId to the server action
  const updatePrizeWithId = updatePrize.bind(null, prize.prizeId);
  const formRef = useRef<HTMLFormElement>(null);
  

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Prize</DialogTitle>
          <DialogDescription>
            Make changes to your prize here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={async (formData) => {
                    await updatePrizeWithId(formData);
                    formRef.current?.reset();
                  }}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" defaultValue={prize.name} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" name="description" defaultValue={prize.description || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pointCost" className="text-right">Point Cost</Label>
              <Input id="pointCost" name="pointCost" type="number" defaultValue={prize.pointCost} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stock</Label>
              <Input id="stock" name="stock" type="number" defaultValue={prize.stock} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={prize.imageUrl || ""} placeholder="https://" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Save Changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
