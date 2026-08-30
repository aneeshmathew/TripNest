// Seeds the DB with the same demo data the old hardcoded arrays used to
// contain — but now there's exactly one source of truth (the database),
// not one array in the frontend and a different one in the backend.
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("user123", 10);

  await prisma.user.upsert({
    where: { email: "user1@mail.com" },
    update: {},
    create: {
      email: "user1@mail.com",
      passwordHash,
      name: "User 1",
      role: Role.TRAVELER
    }
  });

  const listings = [
    {
      title: "Eiffel View Loft",
      price: 210,
      averageRating: 4.8,
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Beachside Villa",
      price: 165,
      averageRating: 4.6,
      location: "Nice, France",
      imageUrl:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Montmartre City Studio",
      price: 120,
      averageRating: 4.3,
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Louvre Garden Apartment",
      price: 240,
      averageRating: 4.9,
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  for (const listing of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: listing.title } });
    if (!existing) {
      await prisma.listing.create({ data: listing });
    }
  }

  console.log("Seed complete: 1 demo user, 4 listings.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
