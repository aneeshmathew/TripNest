// A broader set of globally famous, high-traffic tourist destinations —
// deliberately distinct from data/natGeoDestinations.ts (National
// Geographic's "Best of the World 2026" off-the-beaten-path picks). This
// list is exactly what the homepage "Explore more destinations" gallery
// renders — 50 well-known destinations, none of which duplicate the 25
// curated Nat Geo picks shown in the top DestinationsCarousel.
//
// Reuses the same shape as NatGeoDestination (slug/name/location/blurb/
// imageUrl) so both lists can still be combined for routing purposes —
// see data/allDestinations.ts, used by app/destinations/[slug]/page.tsx
// so every slug from either list resolves to a real destination page.
//
// Image note: these use seeded picsum.photos placeholders (stable per
// slug, so the same destination always gets the same image) rather than
// hand-picked Unsplash photo IDs for each of the 50 places below — swap
// in real per-destination photography (or Unsplash IDs, matching the
// natGeoDestinations pattern) when available. Same "hotlinked, no S3/
// Cloudinary yet" caveat as the rest of the app's images applies here too.
// backend/prisma/seed.ts's `worldDestinationSeeds` reuses these same slugs
// (as `name`/`region`) to seed matching apartments/hotels/restaurants, so
// these 50 destination pages aren't empty the way a purely-frontend list
// would leave them.
import type { NatGeoDestination } from "./natGeoDestinations";

function placeholderImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/900/600`;
}

export const worldDestinations: NatGeoDestination[] = [
  {
    slug: "paris-france",
    name: "Paris",
    location: "France",
    blurb: "The Eiffel Tower, the Louvre, and café culture along the Seine.",
    imageUrl: placeholderImage("paris-france")
  },
  {
    slug: "london-england",
    name: "London",
    location: "England",
    blurb: "Royal history, world-class museums, and the Thames running through it.",
    imageUrl: placeholderImage("london-england")
  },
  {
    slug: "rome-italy",
    name: "Rome",
    location: "Italy",
    blurb: "The Colosseum, the Vatican, and centuries of history underfoot.",
    imageUrl: placeholderImage("rome-italy")
  },
  {
    slug: "new-york-usa",
    name: "New York City",
    location: "USA",
    blurb: "Times Square, Central Park, and a skyline that never sleeps.",
    imageUrl: placeholderImage("new-york-usa")
  },
  {
    slug: "tokyo-japan",
    name: "Tokyo",
    location: "Japan",
    blurb: "Neon-lit streets, ancient shrines, and legendary food culture.",
    imageUrl: placeholderImage("tokyo-japan")
  },
  {
    slug: "dubai-uae",
    name: "Dubai",
    location: "United Arab Emirates",
    blurb: "Record-breaking skyscrapers rising out of the desert.",
    imageUrl: placeholderImage("dubai-uae")
  },
  {
    slug: "bangkok-thailand",
    name: "Bangkok",
    location: "Thailand",
    blurb: "Golden temples, floating markets, and vibrant street food.",
    imageUrl: placeholderImage("bangkok-thailand")
  },
  {
    slug: "singapore",
    name: "Singapore",
    location: "Singapore",
    blurb: "Futuristic gardens, hawker food, and a spotless city-state.",
    imageUrl: placeholderImage("singapore")
  },
  {
    slug: "istanbul-turkiye",
    name: "Istanbul",
    location: "Türkiye",
    blurb: "Where Europe meets Asia across the Bosphorus.",
    imageUrl: placeholderImage("istanbul-turkiye")
  },
  {
    slug: "barcelona-spain",
    name: "Barcelona",
    location: "Spain",
    blurb: "Gaudí's architecture, Mediterranean beaches, and tapas culture.",
    imageUrl: placeholderImage("barcelona-spain")
  },
  {
    slug: "amsterdam-netherlands",
    name: "Amsterdam",
    location: "Netherlands",
    blurb: "Canal-lined streets, world-class museums, and cycling culture.",
    imageUrl: placeholderImage("amsterdam-netherlands")
  },
  {
    slug: "prague-czechia",
    name: "Prague",
    location: "Czechia",
    blurb: "Fairy-tale spires and a beautifully preserved medieval old town.",
    imageUrl: placeholderImage("prague-czechia")
  },
  {
    slug: "venice-italy",
    name: "Venice",
    location: "Italy",
    blurb: "Canals, gondolas, and a city built entirely on water.",
    imageUrl: placeholderImage("venice-italy")
  },
  {
    slug: "santorini-greece",
    name: "Santorini",
    location: "Greece",
    blurb: "Whitewashed cliffside villages over a volcanic caldera.",
    imageUrl: placeholderImage("santorini-greece")
  },
  {
    slug: "bali-indonesia",
    name: "Bali",
    location: "Indonesia",
    blurb: "Rice terraces, surf beaches, and a deep spiritual culture.",
    imageUrl: placeholderImage("bali-indonesia")
  },
  {
    slug: "sydney-australia",
    name: "Sydney",
    location: "Australia",
    blurb: "The Opera House, harbour beaches, and laid-back city life.",
    imageUrl: placeholderImage("sydney-australia")
  },
  {
    slug: "cairo-egypt",
    name: "Cairo",
    location: "Egypt",
    blurb: "The Pyramids of Giza on the edge of a sprawling ancient capital.",
    imageUrl: placeholderImage("cairo-egypt")
  },
  {
    slug: "marrakech-morocco",
    name: "Marrakech",
    location: "Morocco",
    blurb: "Bustling souks, riads, and the gateway to the Atlas Mountains.",
    imageUrl: placeholderImage("marrakech-morocco")
  },
  {
    slug: "kyoto-japan",
    name: "Kyoto",
    location: "Japan",
    blurb: "Thousands of temples, geisha districts, and bamboo groves.",
    imageUrl: placeholderImage("kyoto-japan")
  },
  {
    slug: "seoul-south-korea",
    name: "Seoul",
    location: "South Korea",
    blurb: "Palaces and K-culture energy packed into a 24-hour city.",
    imageUrl: placeholderImage("seoul-south-korea")
  },
  {
    slug: "hong-kong",
    name: "Hong Kong",
    location: "Hong Kong",
    blurb: "A dense skyline framed by mountains and the South China Sea.",
    imageUrl: placeholderImage("hong-kong")
  },
  {
    slug: "machu-picchu-peru",
    name: "Machu Picchu",
    location: "Peru",
    blurb: "The lost Incan citadel high in the Andes.",
    imageUrl: placeholderImage("machu-picchu-peru")
  },
  {
    slug: "cape-town-south-africa",
    name: "Cape Town",
    location: "South Africa",
    blurb: "Table Mountain, wine country, and coastline in one city.",
    imageUrl: placeholderImage("cape-town-south-africa")
  },
  {
    slug: "reykjavik-iceland",
    name: "Reykjavík",
    location: "Iceland",
    blurb: "Gateway to glaciers, geysers, and the northern lights.",
    imageUrl: placeholderImage("reykjavik-iceland")
  },
  {
    slug: "vienna-austria",
    name: "Vienna",
    location: "Austria",
    blurb: "Imperial palaces, coffeehouses, and classical music history.",
    imageUrl: placeholderImage("vienna-austria")
  },
  {
    slug: "budapest-hungary",
    name: "Budapest",
    location: "Hungary",
    blurb: "Thermal baths and grand architecture split by the Danube.",
    imageUrl: placeholderImage("budapest-hungary")
  },
  {
    slug: "florence-italy",
    name: "Florence",
    location: "Italy",
    blurb: "The heart of the Renaissance, art gallery by art gallery.",
    imageUrl: placeholderImage("florence-italy")
  },
  {
    slug: "athens-greece",
    name: "Athens",
    location: "Greece",
    blurb: "The Acropolis and the roots of Western civilization.",
    imageUrl: placeholderImage("athens-greece")
  },
  {
    slug: "lisbon-portugal",
    name: "Lisbon",
    location: "Portugal",
    blurb: "Pastel hillside streets, trams, and fado music by the water.",
    imageUrl: placeholderImage("lisbon-portugal")
  },
  {
    slug: "phuket-thailand",
    name: "Phuket",
    location: "Thailand",
    blurb: "Limestone cliffs, island-hopping, and Andaman Sea beaches.",
    imageUrl: placeholderImage("phuket-thailand")
  },
  {
    slug: "los-angeles-usa",
    name: "Los Angeles",
    location: "California, USA",
    blurb: "Hollywood glamour, beach boardwalks, and year-round sunshine.",
    imageUrl: placeholderImage("los-angeles-usa")
  },
  {
    slug: "san-francisco-usa",
    name: "San Francisco",
    location: "California, USA",
    blurb: "The Golden Gate Bridge, steep hills, and a famously foggy bay.",
    imageUrl: placeholderImage("san-francisco-usa")
  },
  {
    slug: "las-vegas-usa",
    name: "Las Vegas",
    location: "Nevada, USA",
    blurb: "Casino lights, desert spectacle, and round-the-clock entertainment.",
    imageUrl: placeholderImage("las-vegas-usa")
  },
  {
    slug: "toronto-canada",
    name: "Toronto",
    location: "Canada",
    blurb: "A multicultural skyline anchored by the CN Tower.",
    imageUrl: placeholderImage("toronto-canada")
  },
  {
    slug: "cancun-mexico",
    name: "Cancún",
    location: "Mexico",
    blurb: "Turquoise Caribbean water and Mayan ruins nearby.",
    imageUrl: placeholderImage("cancun-mexico")
  },
  {
    slug: "buenos-aires-argentina",
    name: "Buenos Aires",
    location: "Argentina",
    blurb: "Tango, grand boulevards, and steakhouse culture.",
    imageUrl: placeholderImage("buenos-aires-argentina")
  },
  {
    slug: "agra-india",
    name: "Agra",
    location: "India",
    blurb: "Home to the Taj Mahal, one of the world's most iconic monuments.",
    imageUrl: placeholderImage("agra-india")
  },
  {
    slug: "jaipur-india",
    name: "Jaipur",
    location: "India",
    blurb: "The Pink City's palaces, forts, and bustling bazaars.",
    imageUrl: placeholderImage("jaipur-india")
  },
  {
    slug: "petra-jordan",
    name: "Petra",
    location: "Jordan",
    blurb: "A rose-red city carved directly into desert cliffs.",
    imageUrl: placeholderImage("petra-jordan")
  },
  {
    slug: "zurich-switzerland",
    name: "Zürich",
    location: "Switzerland",
    blurb: "Alpine views, a pristine lake, and easy access to the mountains.",
    imageUrl: placeholderImage("zurich-switzerland")
  },
  {
    slug: "edinburgh-scotland",
    name: "Edinburgh",
    location: "Scotland",
    blurb: "A medieval old town beneath a dramatic hilltop castle.",
    imageUrl: placeholderImage("edinburgh-scotland")
  },
  {
    slug: "dublin-ireland",
    name: "Dublin",
    location: "Ireland",
    blurb: "Literary pubs, Georgian streets, and Guinness at the source.",
    imageUrl: placeholderImage("dublin-ireland")
  },
  {
    slug: "copenhagen-denmark",
    name: "Copenhagen",
    location: "Denmark",
    blurb: "Colorful harbours, world-class design, and a bike-first city.",
    imageUrl: placeholderImage("copenhagen-denmark")
  },
  {
    slug: "stockholm-sweden",
    name: "Stockholm",
    location: "Sweden",
    blurb: "Fourteen islands of Scandinavian design and old-town charm.",
    imageUrl: placeholderImage("stockholm-sweden")
  },
  {
    slug: "seville-spain",
    name: "Seville",
    location: "Spain",
    blurb: "Flamenco, orange-tree courtyards, and Moorish palaces.",
    imageUrl: placeholderImage("seville-spain")
  },
  {
    slug: "munich-germany",
    name: "Munich",
    location: "Germany",
    blurb: "Beer halls, Bavarian tradition, and the Alps close by.",
    imageUrl: placeholderImage("munich-germany")
  },
  {
    slug: "kuala-lumpur-malaysia",
    name: "Kuala Lumpur",
    location: "Malaysia",
    blurb: "The Petronas Towers over a melting pot of food and culture.",
    imageUrl: placeholderImage("kuala-lumpur-malaysia")
  },
  {
    slug: "doha-qatar",
    name: "Doha",
    location: "Qatar",
    blurb: "A futuristic skyline on the edge of the Arabian Gulf.",
    imageUrl: placeholderImage("doha-qatar")
  },
  {
    slug: "queenstown-new-zealand",
    name: "Queenstown",
    location: "New Zealand",
    blurb: "The adventure capital of the world, ringed by mountains and lakes.",
    imageUrl: placeholderImage("queenstown-new-zealand")
  },
  {
    slug: "dubrovnik-croatia",
    name: "Dubrovnik",
    location: "Croatia",
    blurb: "Ancient walled city walls overlooking the Adriatic Sea.",
    imageUrl: placeholderImage("dubrovnik-croatia")
  }
];
