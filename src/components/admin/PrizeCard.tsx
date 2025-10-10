// src/components/admin/PrizeCard.tsx

"use client"; // Marks this as a Client Component

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Import the Prize type from your generated client location
import type { Prize } from '@/generated/prisma';

const FALLBACK_IMAGE_URL = "https://via.placeholder.com/300x200.png?text=No+Image";

interface PrizeCardProps {
  readonly prize: Prize;
}

export function PrizeCard({ prize }: PrizeCardProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE_URL;
  };

  return (
    <Card key={prize.prizeId} className="flex flex-col">
      <CardHeader>
        <CardTitle>{prize.name}</CardTitle>
        <CardDescription>{prize.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={prize.imageUrl || FALLBACK_IMAGE_URL}
          alt={prize.name}
          className="rounded-md object-cover w-full h-40"
          onError={handleImageError}
        />
      </CardContent>
      <CardFooter className="flex justify-between font-semibold">
        <span>{prize.pointCost.toLocaleString()} Points</span>
        <span>Stock: {prize.stock}</span>
      </CardFooter>
    </Card>
  );
}