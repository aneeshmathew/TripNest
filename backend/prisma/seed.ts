// Seeds the DB with demo data. Listings now span all 6 continents used by
// the continent map (frontend/src/components/ContinentMap.tsx) — the
// original 4 were all France/Europe, which would leave 5 of 6 continents
// empty and make that feature untestable.
import { Continent, PrismaClient, Role } from "@prisma/client";
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
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Beachside Villa",
      price: 165,
      location: "Nice, France",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Montmartre City Studio",
      price: 120,
      location: "Paris, France",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Louvre Garden Apartment",
      price: 240,
      location: "Paris, France",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Manhattan Skyline Suite",
      price: 280,
      location: "New York, USA",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Copacabana Beachfront Flat",
      price: 150,
      location: "Rio de Janeiro, Brazil",
      continent: Continent.SOUTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Table Mountain View House",
      price: 130,
      location: "Cape Town, South Africa",
      continent: Continent.AFRICA,
      imageUrl:
        "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Shibuya Sky Suite",
      price: 190,
      location: "Tokyo, Japan",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Bondi Beach Bungalow",
      price: 175,
      location: "Sydney, Australia",
      continent: Continent.OCEANIA,
      imageUrl:
        "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80"
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
    },
    "Manhattan Skyline Suite": {
      rating: 5,
      title: "Right in the middle of everything",
      body: "Walked to every major sight. Small for the price, but that's Manhattan for you."
    },
    "Copacabana Beachfront Flat": {
      rating: 4,
      title: "Wake up to the beach",
      body: "Loved being steps from Copacabana. Building's a bit dated but the location makes up for it."
    },
    "Table Mountain View House": {
      rating: 5,
      title: "Incredible views, incredible host",
      body: "Table Mountain right outside the window. The host gave us great local restaurant tips too."
    },
    "Shibuya Sky Suite": {
      rating: 4,
      title: "Compact but perfectly located",
      body: "Tiny by Western standards but spotless and right by the station. Would stay again."
    },
    "Bondi Beach Bungalow": {
      rating: 5,
      title: "Exactly the beach trip we wanted",
      body: "Short walk to Bondi, quiet street, great coffee nearby. Couldn't have asked for more."
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

  // Hotels + restaurants for the cities that overlap with the destination
  // detail pages most likely to be tested (existing apartment cities, plus
  // Vancouver as a Nat Geo Best of the World 2026 pick with no apartment
  // listing yet). Not exhaustive across every destination — real curated
  // rows for the ones that matter for a working demo, not a fabricated
  // full inventory.
  const hotels = [
    {
      name: "Grand Palais Hotel",
      location: "Paris, France",
      continent: Continent.EUROPE,
      price: 320,
      starClass: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Riviera Bay Resort",
      location: "Nice, France",
      continent: Continent.EUROPE,
      price: 210,
      starClass: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Manhattan Central Hotel",
      location: "New York, USA",
      continent: Continent.NORTH_AMERICA,
      price: 380,
      starClass: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Copacabana Palace Inn",
      location: "Rio de Janeiro, Brazil",
      continent: Continent.SOUTH_AMERICA,
      price: 250,
      starClass: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Table Bay Hotel",
      location: "Cape Town, South Africa",
      continent: Continent.AFRICA,
      price: 190,
      starClass: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Shinjuku Sky Hotel",
      location: "Tokyo, Japan",
      continent: Continent.ASIA,
      price: 220,
      starClass: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Harbour View Hotel",
      location: "Sydney, Australia",
      continent: Continent.OCEANIA,
      price: 260,
      starClass: 5,
      imageUrl:
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Stanley Park Lodge",
      location: "Vancouver, Canada",
      continent: Continent.NORTH_AMERICA,
      price: 240,
      starClass: 4,
      imageUrl:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const restaurants = [
    {
      name: "Le Petit Marché",
      location: "Paris, France",
      continent: Continent.EUROPE,
      cuisine: "French",
      priceRange: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Côte d'Azur Bistro",
      location: "Nice, France",
      continent: Continent.EUROPE,
      cuisine: "Mediterranean",
      priceRange: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "The Brooklyn Grill",
      location: "New York, USA",
      continent: Continent.NORTH_AMERICA,
      cuisine: "American",
      priceRange: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Sabor Carioca",
      location: "Rio de Janeiro, Brazil",
      continent: Continent.SOUTH_AMERICA,
      cuisine: "Brazilian",
      priceRange: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Cape Kitchen",
      location: "Cape Town, South Africa",
      continent: Continent.AFRICA,
      cuisine: "South African",
      priceRange: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Izakaya Shibuya",
      location: "Tokyo, Japan",
      continent: Continent.ASIA,
      cuisine: "Japanese",
      priceRange: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Bondi Fish House",
      location: "Sydney, Australia",
      continent: Continent.OCEANIA,
      cuisine: "Seafood",
      priceRange: 3,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Granville Island Market Kitchen",
      location: "Vancouver, Canada",
      continent: Continent.NORTH_AMERICA,
      cuisine: "Canadian",
      priceRange: 2,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  for (const hotel of hotels) {
    const existing = await prisma.hotel.findFirst({ where: { name: hotel.name } });
    if (!existing) {
      await prisma.hotel.create({ data: hotel });
    }
  }

  for (const restaurant of restaurants) {
    const existing = await prisma.restaurant.findFirst({ where: { name: restaurant.name } });
    if (!existing) {
      await prisma.restaurant.create({ data: restaurant });
    }
  }

  console.log(
    `Seed complete: 1 demo user, 9 listings across 6 continents, 9 reviews, ${hotels.length} hotels, ${restaurants.length} restaurants.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
