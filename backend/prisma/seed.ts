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

  // Original 8 curated hotels/restaurants (Paris/Nice/New York/Rio/Cape
  // Town/Tokyo/Sydney/Vancouver) — Rio and Vancouver double as two of the
  // 25 Nat Geo "Best of the World 2026" destinations (see
  // frontend/src/data/natGeoDestinations.ts); the rest predate the
  // destinations feature and exist for continent-map coverage. Ratings
  // (restaurant) and starClass (hotel) are curated numbers, not
  // review-derived — see schema.prisma.
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
      rating: 4.6,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Côte d'Azur Bistro",
      location: "Nice, France",
      continent: Continent.EUROPE,
      cuisine: "Mediterranean",
      priceRange: 2,
      rating: 4.4,
      imageUrl:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "The Brooklyn Grill",
      location: "New York, USA",
      continent: Continent.NORTH_AMERICA,
      cuisine: "American",
      priceRange: 2,
      rating: 4.3,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Sabor Carioca",
      location: "Rio de Janeiro, Brazil",
      continent: Continent.SOUTH_AMERICA,
      cuisine: "Brazilian",
      priceRange: 2,
      rating: 4.5,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Cape Kitchen",
      location: "Cape Town, South Africa",
      continent: Continent.AFRICA,
      cuisine: "South African",
      priceRange: 2,
      rating: 4.4,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Izakaya Shibuya",
      location: "Tokyo, Japan",
      continent: Continent.ASIA,
      cuisine: "Japanese",
      priceRange: 3,
      rating: 4.6,
      imageUrl:
        "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Bondi Fish House",
      location: "Sydney, Australia",
      continent: Continent.OCEANIA,
      cuisine: "Seafood",
      priceRange: 3,
      rating: 4.5,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    },
    {
      name: "Granville Island Market Kitchen",
      location: "Vancouver, Canada",
      continent: Continent.NORTH_AMERICA,
      cuisine: "Canadian",
      priceRange: 2,
      rating: 4.5,
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Real coverage for the 25 Nat Geo "Best of the World 2026" destinations
  // (frontend/src/data/natGeoDestinations.ts) — every destination page's
  // Apartments/Hotels/Restaurants tabs run a keyword search using the
  // destination's exact `name` against title/location/description (see
  // frontend/src/app/destinations/[slug]/page.tsx), so `location` below
  // is deliberately built as "<name>, <region>" for every entry: the
  // destination's exact name has to appear verbatim for the ILIKE match
  // to hit at all. Rio de Janeiro is excluded here — it's one of the
  // original 9 core listings above already. Vancouver already has a
  // hotel + restaurant above (added before this list existed); only its
  // apartment listing is new here. Images reuse each destination's own
  // verified Nat Geo photo (same URLs as natGeoDestinations.ts) rather
  // than sourcing 70+ new ones — the hotel/restaurant "for" a place
  // showing that place's own photo is a reasonable reuse, not a
  // mismatched stock image.
  interface DestinationSeed {
    name: string;
    region: string;
    continent: Continent;
    imageUrl: string;
    listing: { title: string; price: number };
    review: { rating: number; title: string; body: string };
    hotel?: { name: string; price: number; starClass: number };
    restaurant?: { name: string; cuisine: string; priceRange: number; rating: number };
  }

  const destinationSeeds: DestinationSeed[] = [
    {
      name: "The Dolomites",
      region: "Italy",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Alpine Chalet Retreat", price: 195 },
      review: {
        rating: 5,
        title: "Peaks right outside every window",
        body: "Hiked straight from the front door and never got tired of the view. Wood stove made cold nights cozy."
      },
      hotel: { name: "Dolomiti Peak Lodge", price: 280, starClass: 5 },
      restaurant: { name: "Rifugio delle Alpi", cuisine: "Italian", priceRange: 3, rating: 4.7 }
    },
    {
      name: "Vancouver",
      region: "British Columbia, Canada",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1560814304-4f05b62af116?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Coal Harbour Waterfront Suite", price: 220 },
      review: {
        rating: 5,
        title: "Mountains and ocean in one view",
        body: "Woke up to seaplanes taking off over the harbour with the North Shore mountains right there. Walkable to everything downtown."
      }
      // hotel/restaurant already seeded above (Stanley Park Lodge, Granville Island Market Kitchen)
    },
    {
      name: "Beijing",
      region: "China",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Hutong Courtyard House", price: 140 },
      review: {
        rating: 4,
        title: "Old Beijing charm, modern comfort",
        body: "Tucked in a quiet hutong minutes from the Forbidden City. Thin walls but full of character."
      },
      hotel: { name: "Forbidden City View Hotel", price: 260, starClass: 5 },
      restaurant: { name: "Old Beijing Noodle House", cuisine: "Chinese", priceRange: 2, rating: 4.5 }
    },
    {
      name: "Rabat",
      region: "Morocco",
      continent: Continent.AFRICA,
      imageUrl:
        "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Medina Riad Retreat", price: 110 },
      review: {
        rating: 5,
        title: "A quiet riad in the heart of the medina",
        body: "Beautiful tiled courtyard, incredibly peaceful despite being steps from the souks."
      },
      hotel: { name: "Kasbah View Hotel", price: 175, starClass: 4 },
      restaurant: { name: "Chellah Garden Restaurant", cuisine: "Moroccan", priceRange: 2, rating: 4.6 }
    },
    {
      name: "Hull",
      region: "Yorkshire, England",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Marina Waterfront Flat", price: 95 },
      review: {
        rating: 4,
        title: "Underrated and full of surprises",
        body: "Right on the marina, walking distance to the Deep aquarium. Better value than anywhere else in Yorkshire we looked."
      },
      hotel: { name: "Humber Estuary Hotel", price: 130, starClass: 3 },
      restaurant: { name: "The Trawlerman's Table", cuisine: "British", priceRange: 2, rating: 4.3 }
    },
    {
      name: "Manila",
      region: "Philippines",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Intramuros Heritage Loft", price: 85 },
      review: {
        rating: 4,
        title: "History right outside the door",
        body: "Steps from Fort Santiago and the old walled city. Traffic outside is loud but the loft itself was quiet."
      },
      hotel: { name: "Manila Bay Sunset Hotel", price: 150, starClass: 4 },
      restaurant: { name: "Kainan sa Baywalk", cuisine: "Filipino", priceRange: 2, rating: 4.4 }
    },
    {
      name: "Akagera National Park",
      region: "Rwanda",
      continent: Continent.AFRICA,
      imageUrl:
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Savanna Edge Safari Cabin", price: 175 },
      review: {
        rating: 5,
        title: "Woke up to giraffes outside the fence",
        body: "Best safari value we've found anywhere. The rangers know every animal by name, it felt like."
      },
      hotel: { name: "Akagera National Park Lodge", price: 240, starClass: 4 },
      restaurant: { name: "Lakeside Grill Akagera", cuisine: "Rwandan", priceRange: 3, rating: 4.7 }
    },
    {
      name: "Oulu",
      region: "Finland",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1517783999520-f068d7431a60?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Northern Lights Cabin", price: 130 },
      review: {
        rating: 5,
        title: "Aurora views from the bed",
        body: "Skylight over the bed meant we caught the northern lights without leaving under the covers. Sauna included."
      },
      hotel: { name: "Oulu Archipelago Hotel", price: 195, starClass: 4 },
      restaurant: { name: "Toripolliisi Kitchen", cuisine: "Finnish", priceRange: 2, rating: 4.5 }
    },
    {
      name: "Route 66",
      region: "Oklahoma, USA",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Roadside Route 66 Motor Court", price: 75 },
      review: {
        rating: 4,
        title: "Classic Americana done right",
        body: "Neon sign, vinyl records in the room, and the diner next door has the best pie on the whole route."
      },
      hotel: { name: "Mother Road Motor Lodge", price: 110, starClass: 3 },
      restaurant: { name: "Chicken-Fried Diner", cuisine: "American", priceRange: 1, rating: 4.4 }
    },
    {
      name: "Coastal Oaxaca",
      region: "Mexico",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Puerto Escondido Beach Bungalow", price: 90 },
      review: {
        rating: 5,
        title: "Surf, sunsets, and incredible food",
        body: "Fell asleep to the waves every night and the mezcal bar down the road was unreal."
      },
      hotel: { name: "Zicatela Point Hotel", price: 160, starClass: 4 },
      restaurant: { name: "Mezcalería del Mar", cuisine: "Oaxacan", priceRange: 2, rating: 4.7 }
    },
    {
      name: "Medellín",
      region: "Colombia",
      continent: Continent.SOUTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "El Poblado City View Apartment", price: 100 },
      review: {
        rating: 5,
        title: "City of eternal spring lives up to the name",
        body: "Cable car views over the whole valley and the neighborhood is full of great coffee shops."
      },
      hotel: { name: "Poblado Skyline Hotel", price: 170, starClass: 4 },
      restaurant: { name: "Bandeja Paisa House", cuisine: "Colombian", priceRange: 2, rating: 4.5 }
    },
    {
      name: "North Dakota Badlands",
      region: "USA",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Badlands Overlook Cabin", price: 105 },
      review: {
        rating: 5,
        title: "Silence and stars like nowhere else",
        body: "Bison wandered past the cabin at dawn. No cell signal, which was exactly the point."
      },
      hotel: { name: "Theodore Roosevelt Ranch Lodge", price: 165, starClass: 3 },
      restaurant: { name: "Prairie Fire Steakhouse", cuisine: "American", priceRange: 3, rating: 4.4 }
    },
    {
      name: "Pittsburgh",
      region: "Pennsylvania, USA",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1756752094596-cfb831a76aaa?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Three Rivers Loft", price: 115 },
      review: {
        rating: 4,
        title: "Underrated city, great value",
        body: "Views of all three rivers from the balcony and the food scene blew us away."
      },
      hotel: { name: "Steel City Skyline Hotel", price: 190, starClass: 4 },
      restaurant: { name: "Strip District Kitchen", cuisine: "American", priceRange: 2, rating: 4.4 }
    },
    {
      name: "Québec",
      region: "Canada",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1519178614-68673b201f36?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Old Québec Stone House", price: 135 },
      review: {
        rating: 5,
        title: "Like stepping into Europe without the flight",
        body: "Cobblestone streets right outside, and the fireplace made the whole stay feel like a postcard."
      },
      hotel: { name: "Château Frontenac View Hotel", price: 230, starClass: 5 },
      restaurant: {
        name: "Petit Bistro du Vieux-Québec",
        cuisine: "French-Canadian",
        priceRange: 3,
        rating: 4.6
      }
    },
    {
      name: "Dongseo Trail",
      region: "South Korea",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Trailhead Hanok Stay", price: 80 },
      review: {
        rating: 4,
        title: "Perfect base for the trail",
        body: "Traditional hanok right at the trailhead. Host packed us rice balls for the hike each morning."
      },
      hotel: { name: "Dongseo Trail Inn", price: 120, starClass: 3 },
      restaurant: { name: "Trailside Bibimbap House", cuisine: "Korean", priceRange: 1, rating: 4.5 }
    },
    {
      name: "Uluru-Kata Tjuta",
      region: "Australia",
      continent: Continent.OCEANIA,
      imageUrl:
        "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Red Centre Desert Retreat", price: 190 },
      review: {
        rating: 5,
        title: "Watching the rock change color at sunset",
        body: "Nothing prepares you for seeing Uluru change colors at sunset from the deck. Once-in-a-lifetime."
      },
      hotel: { name: "Ayers Rock Desert Lodge", price: 310, starClass: 4 },
      restaurant: { name: "Desert Dune Dining", cuisine: "Australian", priceRange: 4, rating: 4.6 }
    },
    {
      name: "Yamagata",
      region: "Japan",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Onsen Ryokan Retreat", price: 145 },
      review: {
        rating: 5,
        title: "Hot springs and snow monkeys nearby",
        body: "The private onsen overlooking the mountains was worth the trip alone."
      },
      hotel: { name: "Zao Onsen Mountain Hotel", price: 210, starClass: 4 },
      restaurant: { name: "Imoni Nabe House", cuisine: "Japanese", priceRange: 2, rating: 4.6 }
    },
    {
      name: "Dominica",
      region: "Caribbean",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Rainforest Canopy Cottage", price: 120 },
      review: {
        rating: 5,
        title: "Waterfalls and rainforest right outside",
        body: "Hiked to three waterfalls in one day without ever getting in a car. Nature Island lives up to its name."
      },
      hotel: { name: "Boiling Lake Eco Lodge", price: 175, starClass: 4 },
      restaurant: { name: "Kalinago Kitchen", cuisine: "Caribbean", priceRange: 2, rating: 4.5 }
    },
    {
      name: "Basque Country",
      region: "Spain",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "San Sebastián Old Town Flat", price: 155 },
      review: {
        rating: 5,
        title: "Pintxos crawl right outside the door",
        body: "Best food city in Spain, no contest. Beach and old town both a five-minute walk."
      },
      hotel: { name: "La Concha Bay Hotel", price: 240, starClass: 4 },
      restaurant: { name: "Pintxos Alley", cuisine: "Basque", priceRange: 3, rating: 4.8 }
    },
    {
      name: "Black Sea Coast",
      region: "Türkiye",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Trabzon Coastal Cottage", price: 90 },
      review: {
        rating: 4,
        title: "Tea gardens and misty mountains",
        body: "Green tea terraces climbing the hills right behind the house, and the coast views were stunning."
      },
      hotel: { name: "Black Sea Highland Hotel", price: 140, starClass: 4 },
      restaurant: { name: "Anchovy Coast Grill", cuisine: "Turkish", priceRange: 2, rating: 4.5 }
    },
    {
      name: "Fiji",
      region: "South Pacific",
      continent: Continent.OCEANIA,
      imageUrl:
        "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Overwater Bungalow Fiji", price: 260 },
      review: {
        rating: 5,
        title: "Turquoise water right under the floor",
        body: "Glass panel in the floor showed fish swimming below us all day. Snorkeling straight off the deck."
      },
      hotel: { name: "Coral Reef Resort Fiji", price: 380, starClass: 5 },
      restaurant: { name: "Kava Point Restaurant", cuisine: "Fijian", priceRange: 3, rating: 4.7 }
    },
    {
      name: "Guimarães",
      region: "Portugal",
      continent: Continent.EUROPE,
      imageUrl:
        "https://images.unsplash.com/photo-1662149191062-68917c79bbd6?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Medieval Quarter Townhouse", price: 100 },
      review: {
        rating: 5,
        title: "Birthplace of Portugal, and it shows",
        body: "Castle visible from the window and the old town felt like walking through a history book."
      },
      hotel: { name: "Castelo View Hotel", price: 165, starClass: 4 },
      restaurant: { name: "Solar do Arco Tasca", cuisine: "Portuguese", priceRange: 2, rating: 4.6 }
    },
    {
      name: "Khiva",
      region: "Uzbekistan",
      continent: Continent.ASIA,
      imageUrl:
        "https://images.unsplash.com/photo-1596386461350-326ccb383e9f?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Silk Road Courtyard House", price: 70 },
      review: {
        rating: 5,
        title: "Like stepping back onto the Silk Road",
        body: "The walled old city lit up at night was unforgettable. Host served tea on the rooftop every evening."
      },
      hotel: { name: "Itchan Kala Heritage Hotel", price: 120, starClass: 4 },
      restaurant: { name: "Silk Road Plov House", cuisine: "Uzbek", priceRange: 1, rating: 4.6 }
    },
    {
      name: "Maui",
      region: "Hawaii, USA",
      continent: Continent.NORTH_AMERICA,
      imageUrl:
        "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1200&q=80",
      listing: { title: "Road to Hana Ocean Cottage", price: 210 },
      review: {
        rating: 5,
        title: "Waterfalls, ocean, and unreal sunrises",
        body: "Drove the Road to Hana and came home to a private cottage with ocean views. Watched the sunrise from Haleakalā the next morning."
      },
      hotel: { name: "Kaanapali Beach Resort", price: 340, starClass: 5 },
      restaurant: { name: "Lahaina Fish Shack", cuisine: "Hawaiian", priceRange: 3, rating: 4.6 }
    }
  ];

  for (const dest of destinationSeeds) {
    const location = `${dest.name}, ${dest.region}`;

    listings.push({
      title: dest.listing.title,
      price: dest.listing.price,
      location,
      continent: dest.continent,
      imageUrl: dest.imageUrl
    });
    reviewsByListingTitle[dest.listing.title] = dest.review;

    if (dest.hotel) {
      hotels.push({
        name: dest.hotel.name,
        location,
        continent: dest.continent,
        price: dest.hotel.price,
        starClass: dest.hotel.starClass,
        imageUrl: dest.imageUrl
      });
    }

    if (dest.restaurant) {
      restaurants.push({
        name: dest.restaurant.name,
        location,
        continent: dest.continent,
        cuisine: dest.restaurant.cuisine,
        priceRange: dest.restaurant.priceRange,
        rating: dest.restaurant.rating,
        imageUrl: dest.imageUrl
      });
    }
  }

  const createdListings = [];
  for (const listing of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: listing.title } });
    const record = existing ?? (await prisma.listing.create({ data: listing }));
    createdListings.push(record);
  }

  // One review per listing from the demo user (the unique [listingId,
  // userId] constraint allows exactly one), so each listing shows real
  // aggregated rating data rather than a hardcoded 0.
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
    } else if (existing.rating === 0 && restaurant.rating !== 0) {
      // Backfills rating on a restaurant row created before the `rating`
      // column existed (defaulted to 0 by the migration) — without this,
      // re-running the seed against an existing DB wouldn't pick up the
      // curated rating value at all, since the "already exists" branch
      // above otherwise skips it entirely.
      await prisma.restaurant.update({ where: { id: existing.id }, data: { rating: restaurant.rating } });
    }
  }

  console.log(
    `Seed complete: 1 demo user, ${listings.length} listings across 6 continents, ${createdListings.length} reviews, ${hotels.length} hotels, ${restaurants.length} restaurants.`
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
