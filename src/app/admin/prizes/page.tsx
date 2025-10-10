// src/app/admin/prizes/page.tsx
import { PrismaClient } from "@/generated/prisma";
import { CreatePrizeDialog } from "@/components/admin/CreatePrizeDialog";
import { PrizeCard } from "@/components/admin/PrizeCard";

// Initialize Prisma Client
const prisma = new PrismaClient();

// Fetch all prizes from the database
async function getPrizes() {
  const prizes = await prisma.prize.findMany({
    where: {
      isEnabled: true,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
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
      {prizes.length === 0 ? (
        <p>No prizes found. Add one to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <PrizeCard key={prize.prizeId} prize={prize} />
          ))}
        </div>
      )}
    </div>
  );
}
