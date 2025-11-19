// src/components/facilitators/FacilitatorDetailsDialog.tsx
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
import { getFacilitatorDetails } from "@/app/[locale]/admin/facilitators/actions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Eye, TrendingUp, Gift } from "lucide-react";

interface FacilitatorDetailsDialogProps {
  readonly facilitatorId: string;
  readonly userName: string | null;
}

interface FacilitatorDetails {
  facilitatorId: string;
  userId: string;
  availablePointsToGrant: number;
  createdAt: Date;
  user: {
    name: string | null;
    email: string | null;
    points: number;
  };
  grantedTransactions: Array<{
    id: string;
    amount: number;
    description: string | null;
    createdAt: Date;
    user: {
      name: string | null;
    };
  }>;
  createdPrizes: Array<{
    prizeId: string;
    name: string;
    pointCost: number;
    createdAt: Date;
  }>;
}

export function FacilitatorDetailsDialog({ facilitatorId, userName }: FacilitatorDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState<FacilitatorDetails | null>(null);

  useEffect(() => {
    if (open && !details) {
      loadDetails();
    }
  }, [open]);

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const result = await getFacilitatorDetails(facilitatorId);
      
      if (result.success && result.facilitator) {
        setDetails(result.facilitator as FacilitatorDetails);
      } else {
        toast.error(result.message || "Failed to load facilitator details");
      }
    } catch (error) {
      console.error("Error loading facilitator details:", error);
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
          <DialogTitle>Facilitator Details: {userName}</DialogTitle>
          <DialogDescription>
            Complete information about this facilitator's activity
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading facilitator details...
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Name:</div>
                <div>{details.user.name}</div>
                
                <div className="text-muted-foreground">Email:</div>
                <div>{details.user.email || "Not set"}</div>
                
                <div className="text-muted-foreground">Personal Points:</div>
                <div className="font-semibold">{details.user.points.toLocaleString()}</div>
                
                <div className="text-muted-foreground">Available to Grant:</div>
                <div className="font-semibold">{details.availablePointsToGrant.toLocaleString()}</div>
                
                <div className="text-muted-foreground">Facilitator Since:</div>
                <div>{new Date(details.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Granted Transactions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Point Grants
              </h3>
              {details.grantedTransactions.length > 0 ? (
                <div className="space-y-2">
                  {details.grantedTransactions.map((tx) => (
                    <div key={tx.id} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            +{tx.amount} points to {tx.user.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {tx.description || "No description"}
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
                  No point grants yet
                </div>
              )}
            </div>

            {/* Created Prizes */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Created Prizes
              </h3>
              {details.createdPrizes.length > 0 ? (
                <div className="space-y-2">
                  {details.createdPrizes.map((prize) => (
                    <div key={prize.prizeId} className="border rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{prize.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {prize.pointCost} points
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(prize.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No prizes created yet
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

