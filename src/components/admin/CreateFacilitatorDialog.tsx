// src/components/admin/CreateFacilitatorDialog.tsx
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
import { createFacilitator, getAvailableUsers } from "@/app/admin/facilitators/actions";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

interface User {
  userId: string;
  name: string | null;
  email: string | null;
}

export function CreateFacilitatorDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) {
      loadAvailableUsers();
    }
  }, [open]);

  const loadAvailableUsers = async () => {
    try {
      const result = await getAvailableUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createFacilitator(formData);

      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setOpen(false);
      } else if (result.errors) {
        toast.error(JSON.stringify(result.errors));
      } else {
        toast.error(result.message || "Failed to create facilitator");
      }
    } catch (error) {
      console.error("Error creating facilitator:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Facilitator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Facilitator</DialogTitle>
          <DialogDescription>
            Assign facilitator privileges to a user. They will be able to manage prizes, scan events, and grant points.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userId" className="text-right">
                User *
              </Label>
              <select
                id="userId"
                name="userId"
                required
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.name} {user.email ? `(${user.email})` : ""}
                  </option>
                ))}
              </select>
            </div>
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
                defaultValue="100"
                className="col-span-3"
                placeholder="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Facilitator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
