// src/components/prizes/ShopPrizeCard.tsx

"use client";

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
import { useTranslations } from "next-intl";
import { TrendingUp, Package, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Prize } from '@/generated/prisma';

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/300x200.png?text=No+Image";

interface ShopPrizeCardProps {
  readonly prize: Prize;
}

export function ShopPrizeCard({ prize }: ShopPrizeCardProps) {
  const t = useTranslations('prizes');
  const ts = useTranslations('shop');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  };

  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    setIsAddingToCart(true);

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prizeId: prize.prizeId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(ts('addedToCart'));
        // Dispatch event to refresh cart count
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error(data.error || ts('addToCartError'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2">
      <div className="relative">
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
            {prize.stock > 0 ? `${prize.stock} ${t('stock')}` : t('outOfStock')}
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
          <span>{prize.stock > 0 ? `${prize.stock} ${t('available')}` : t('outOfStock')}</span>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={prize.stock === 0 || !prize.isEnabled || isAddingToCart}
          className="flex items-center gap-2"
        >
          {isAddingToCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {isAddingToCart ? ts('adding') : ts('addToCart')}
        </Button>
      </CardFooter>
    </Card>
  );
}