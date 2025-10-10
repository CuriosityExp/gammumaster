// src/app/admin/prizes/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PrismaClient } from '@/generated/prisma';
import { CreatePrizeDialog } from "@/components/admin/CreatePrizeDialog";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Fetch all prizes from the database
async function getPrizes() {
  const prizes = await prisma.prize.findMany({
    where: { isEnabled: true },
    orderBy: { createdAt: 'desc' }
  });
  return prizes;
}

export default async function AdminPrizesPage() {
  const prizes = await getPrizes();

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Prizes</h1>
        <CreatePrizeDialog /> {/* 2. Add the component here */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes.map((prize) => (
          // --- UPDATED THIS LINE ---
          <Card key={prize.prizeId} className="flex flex-col"> 
            <CardHeader>
              <CardTitle>{prize.name}</CardTitle>
              <CardDescription>{prize.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={prize.imageUrl || ''} 
                alt={prize.name} 
                className="rounded-md object-cover w-full h-40"
              />
            </CardContent>
            <CardFooter className="flex justify-between font-semibold">
              <span>{prize.pointCost.toLocaleString()} Points</span>
              <span>Stock: {prize.stock}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}