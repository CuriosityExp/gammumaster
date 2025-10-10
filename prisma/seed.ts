// prisma/seed.ts
import { PrismaClient } from "@/generated/prisma"; // Using your alias now
const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Clear existing data to prevent duplicates on re-seed
  await prisma.prize.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();

  // --- Create Admin and Prizes (same as before) ---
  const admin = await prisma.admin.create({
    data: {
      email: "admin@example.com",
      availablePointsToGrant: 50000,
    },
  });
  console.log(`Created admin with id: ${admin.adminId}`);

  await prisma.prize.create({
    data: {
      name: "Modern T-Shirt",
      description: "A stylish and comfortable t-shirt with our logo.",
      pointCost: 1500,
      stock: 100,
      imageUrl: "https://via.placeholder.com/300x200.png?text=T-Shirt",
      adminId: admin.adminId,
    },
  });
  await prisma.prize.create({
    data: {
      name: "Sleek Water Bottle",
      description: "Stay hydrated with this modern water bottle.",
      pointCost: 800,
      stock: 250,
      imageUrl: "https://via.placeholder.com/300x200.png?text=Water+Bottle",
      adminId: admin.adminId, 
    },
  });
  console.log("Seeded prizes.");

  // --- NEW: Create Sample Users ---
  await prisma.user.createMany({
    data: [
      { name: "Alice", email: "alice@example.com", points: 1200 },
      { name: "Bob", email: "bob@example.com", points: 350 },
      { name: "Charlie", email: "charlie@example.com", points: 5000 },
    ],
  });
  console.log("Seeded users.");

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
