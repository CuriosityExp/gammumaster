// src/components/admin/UserDetailsDialog.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUserDetails } from "@/app/[locale]/admin/users/actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Eye, Calendar, Gift, TrendingUp } from "lucide-react";

interface UserDetailsDialogProps {
  readonly userId: string;
  readonly userName: string | null;
}

interface UserDetails {
  userId: string;
  name: string | null;
  email: string | null;
  qrCodeIdentifier: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdBy: { email: string } | null;
  transactions: Array<{
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: Date;
    admin: { email: string } | null;
    facilitator: { userId: string } | null;
  }>;
  eventAttendances: Array<{
    id: number;
    attendedAt: Date;
    event: {
      title: string;
      pointAmount: number;
    };
  }>;
}

export function UserDetailsDialog({ userId, userName }: UserDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    if (open && !userDetails) {
      loadUserDetails();
    }
  }, [open]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getUserDetails(userId);
      
      if (result.success && result.user) {
        setUserDetails(result.user as UserDetails);
      } else {
        toast.error(result.message || "Failed to load user details");
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details: {userName}</DialogTitle>
          <DialogDescription>
            Complete information about this user's account and activity
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading user details...
          </div>
        ) : userDetails ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Email:</div>
                <div>{userDetails.email || "Not set"}</div>
                
                <div className="text-muted-foreground">Current Points:</div>
                <div className="font-semibold">{userDetails.points.toLocaleString()}</div>
                
                <div className="text-muted-foreground">QR Identifier:</div>
                <div className="font-mono text-xs">{userDetails.qrCodeIdentifier}</div>
                
                <div className="text-muted-foreground">Created By:</div>
                <div>{userDetails.createdBy?.email || "System"}</div>
                
                <div className="text-muted-foreground">Created At:</div>
                <div>{new Date(userDetails.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Transactions
              </h3>
              {userDetails.transactions.length > 0 ? (
                <div className="space-y-2">
                  {userDetails.transactions.map((tx) => (
                    <div key={tx.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {tx.amount > 0 ? "+" : ""}{tx.amount} points
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {tx.description || "No description"}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {tx.admin?.email || (tx.facilitator ? "Facilitator" : "System")}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No transactions yet
                </div>
              )}
            </div>

            {/* Event Attendances */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Event Attendances
              </h3>
              {userDetails.eventAttendances.length > 0 ? (
                <div className="space-y-2">
                  {userDetails.eventAttendances.map((attendance) => (
                    <div key={attendance.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{attendance.event.title}</div>
                          <div className="text-muted-foreground text-xs">
                            +{attendance.event.pointAmount} points earned
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(attendance.attendedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No event attendances yet
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

