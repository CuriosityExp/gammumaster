// src/components/prizes/PrizeCard.tsx

"use client"; // Marks this as a Client Component

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Package, TrendingUp, X } from "lucide-react";
// Import the Prize type from your generated client location
import type { Prize } from '@/generated/prisma';
import { EditPrizeDialog } from "./EditPrizeDialog";
import { DeletePrizeAlert } from "./DeletePrizeAlert";

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/300x200.png?text=No+Image";

interface PrizeCardProps {
  readonly prize: Prize;
}

export function PrizeCard({ prize }: PrizeCardProps) {
  const t = useTranslations('prizes');
  const tCommon = useTranslations('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening dialog if clicking on any interactive element (button, input, textarea, select, label)
    const interactive = (e.target as HTMLElement).closest('button, input, textarea, select, label, [role="dialog"]');
    if (interactive) {
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card 
        key={prize.prizeId} 
        className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={prize.imageUrl || FALLBACK_IMAGE_URL}
          alt={prize.name}
          className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          onError={handleImageError}
        />
        <div className="absolute top-3 right-3">
          <Badge 
            variant={prize.stock > 10 ? "default" : prize.stock > 0 ? "secondary" : "destructive"}
            className="shadow-lg backdrop-blur-sm bg-opacity-90"
          >
            {prize.stock > 0 ? `${prize.stock} ${t('stock')}` : t('disabled')}
          </Badge>
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-xl">{prize.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">{prize.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow pt-0">
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{t('pointCost')}</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {prize.pointCost.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-4 border-t bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{prize.stock > 0 ? `${prize.stock} ${t('stock')}` : t('disabled')}</span>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <EditPrizeDialog prize={prize} />
          <DeletePrizeAlert prizeId={prize.prizeId} prizeName={prize.name} />
        </div>
      </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              {prize.name}
              <Badge 
                variant={prize.stock > 10 ? "default" : prize.stock > 0 ? "secondary" : "destructive"}
                className="ml-2"
              >
                {prize.stock > 0 ? `${prize.stock} ${t('stock')}` : t('disabled')}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              {prize.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Prize Image */}
            <div className="relative rounded-lg overflow-hidden border-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={prize.imageUrl || FALLBACK_IMAGE_URL}
                alt={prize.name}
                className="w-full h-80 object-cover"
                onError={handleImageError}
              />
            </div>

            {/* Prize Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Point Cost */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('pointCost')}</span>
                  <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {prize.pointCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('stock')}</span>
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {prize.stock > 0 ? prize.stock : t('disabled')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <EditPrizeDialog prize={prize} />
              <DeletePrizeAlert prizeId={prize.prizeId} prizeName={prize.name} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}