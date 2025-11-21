// src/app/[locale]/dashboard/cart/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Cart, UserCart, Prize } from '@/generated/prisma';

interface CartItem extends UserCart {
  prize: Prize;
}

export default function CartPage() {
  const t = useTranslations('cart');
  const ts = useTranslations('shop');
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data.cart);
        setCartItems(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(cartItemId));

    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
        toast.success('Quantity updated');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItemId,
        }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
        toast.success('Item removed from cart');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const totalPoints = cartItems.reduce((sum, item) => sum + (item.prize.pointCost * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/shop">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToShop')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('emptyCart')}</h3>
            <p className="text-muted-foreground mb-4">{t('emptyCartDescription')}</p>
            <Link href="/dashboard/shop">
              <Button>{t('continueShopping')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Prize Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      <img
                        src={item.prize.imageUrl || "https://via.placeholder.com/80x80.png?text=No+Image"}
                        alt={item.prize.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/80x80.png?text=No+Image";
                        }}
                      />
                    </div>

                    {/* Prize Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.prize.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.prize.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {item.prize.pointCost.toLocaleString()} points each
                        </Badge>
                        {item.prize.stock < item.quantity && (
                          <Badge variant="destructive">Low stock</Badge>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updatingItems.has(item.id) || item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          if (newQty >= 1 && newQty <= item.prize.stock) {
                            updateQuantity(item.id, newQty);
                          }
                        }}
                        className="w-16 text-center"
                        min="1"
                        max={item.prize.stock}
                        disabled={updatingItems.has(item.id)}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updatingItems.has(item.id) || item.quantity >= item.prize.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Subtotal and Remove */}
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {(item.prize.pointCost * item.quantity).toLocaleString()} points
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cartSummary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t('totalItems')}: {totalItems}</span>
                <span>{t('totalPoints')}: {totalPoints.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{t('totalCost')}</span>
                <span className="text-primary">{totalPoints.toLocaleString()} points</span>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/shop" className="flex-1">
                  <Button variant="outline" className="w-full">
                    {t('continueShopping')}
                  </Button>
                </Link>
                <Button className="flex-1" disabled={totalPoints === 0}>
                  {t('checkout')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}