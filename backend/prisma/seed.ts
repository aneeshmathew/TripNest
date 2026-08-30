// Seeds the DB with the same demo data the old hardcoded arrays used to
// contain — but now there's exactly one source of truth (the database),
// not one array in the frontend and a different one in the backend.
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("user123", 10);

  const demoUser = await prisma.user.upsert({
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
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Beachside Villa",
      price: 165,
      location: "Nice, France",
      imageUrl:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Montmartre City Studio",
      price: 120,
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Louvre Garden Apartment",
      price: 240,
      location: "Paris, France",
      imageUrl:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // averageRating/reviewCount are intentionally omitted here — they're
  // derived fields (see reviews.service.ts:recomputeListingRating) and get
  // set below from the seeded reviews, the same way they'd be set by real
  // review activity.
  const createdListings = [];
  for (const listing of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: listing.title } });
    const record = existing ?? (await prisma.listing.create({ data: listing }));
    createdListings.push(record);
  }

  // One review per listing from the demo user (the unique [listingId,
  // userId] constraint allows exactly one), so each listing shows real
  // aggregated rating data rather than a hardcoded 0.
  const reviewsByListingTitle: Record<string, { rating: number; title: string; body: string }> = {
    "Eiffel View Loft": {
      rating: 5,
      title: "Unreal views, exactly as pictured",
      body: "Woke up to the Eiffel Tower every morning. Small kitchen but that view makes up for everything."
    },
    "Beachside Villa": {
      rating: 4,
      title: "Great location, a bit noisy at night",
      body: "Steps from the beach and very spacious. Street noise on weekends was the only downside."
    },
    "Montmartre City Studio": {
      rating: 4,
      title: "Charming and central",
      body: "Cozy studio in a great neighborhood, lots of cafes nearby. Fifth-floor walk-up though, no elevator."
    },
    "Louvre Garden Apartment": {
      rating: 5,
      title: "Best stay we've had in Paris",
      body: "Spotless, beautifully furnished, and the host was incredibly responsive. Would book again in a heartbeat."
    }
  };

  for (const listing of createdListings) {
    const seedReview = reviewsByListingTitle[listing.title];
    if (!seedReview) continue;

    await prisma.review.upsert({
      where: { listingId_userId: { listingId: listing.id, userId: demoUser.id } },
      update: {},
      create: {
        listingId: listing.id,
        userId: demoUser.id,
        rating: seedReview.rating,
        title: seedReview.title,
        body: seedReview.body
      }
    });

    // Mirrors reviews.service.ts:recomputeListingRating — with exactly one
    // seeded review per listing, the average is just that review's rating.
    await prisma.listing.update({
      where: { id: listing.id },
      data: { averageRating: seedReview.rating, reviewCount: 1 }
    });
  }

  console.log("Seed complete: 1 demo user, 4 listings, 4 reviews.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
