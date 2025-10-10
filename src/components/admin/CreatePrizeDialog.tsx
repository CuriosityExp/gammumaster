// src/components/admin/CreatePrizeDialog.tsx

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
import { createPrize } from "@/app/admin/prizes/action";
import { useRef } from "react";

export function CreatePrizeDialog() {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>New Prize</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Prize</DialogTitle>
          <DialogDescription>
            Add the details for the new prize. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={async (formData) => {
            await createPrize(formData);
            formRef.current?.reset();
            // We would add proper success/error handling here
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" name="description" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pointCost" className="text-right">Point Cost</Label>
              <Input id="pointCost" name="pointCost" type="number" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">Stock</Label>
              <Input id="stock" name="stock" type="number" required defaultValue="0" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" placeholder="https://" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            {/* We wrap the submit button in DialogClose to close the dialog on success */}
            <DialogClose asChild>
              <Button type="submit">Save Prize</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}