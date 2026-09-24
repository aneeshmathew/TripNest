// The homepage's top "Popular Destinations" strip (see Hero.tsx ->
// DestinationsSection.tsx) — 30 globally recognizable, high-search-volume
// destinations, replacing the earlier National Geographic "Best of the
// World 2026" list (data/natGeoDestinations.ts, still used elsewhere —
// see data/allDestinations.ts — just no longer the source for this one
// carousel). Exactly 30 so the 6-tiles-per-page carousel lands on a clean
// 5 pages with nothing left over.
//
// `imageUrl` here is only a fallback for when Unsplash has nothing (no
// access key configured, rate-limited, or no match) — a stable per-slug
// placeholder, same approach as data/worldDestinations.ts.
// DestinationsSection.tsx (an async Server Component) fetches the real
// photo for each from Unsplash at request time via lib/unsplash.ts's
// getDestinationPhotoUrl(), the same call the destination detail pages
// already make.
export interface PopularDestination {
  slug: string;
  name: string;
  location: string;
  imageUrl: string;
}

function placeholderImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/900/600`;
}

const popularDestinationNames: Omit<PopularDestination, "imageUrl">[] = [
  { slug: "rome", name: "Rome", location: "Italy" },
  { slug: "tokyo", name: "Tokyo", location: "Japan" },
  { slug: "prague", name: "Prague", location: "Czech Republic" },
  { slug: "swiss-alps", name: "Swiss Alps", location: "Switzerland" },
  { slug: "mauritius", name: "Mauritius", location: "Mauritius" },
  { slug: "iguazu-falls", name: "Iguazu Falls", location: "Argentina/Brazil" },
  { slug: "amsterdam", name: "Amsterdam", location: "Netherlands" },
  { slug: "machu-picchu", name: "Machu Picchu", location: "Peru" },
  { slug: "palawan", name: "Palawan", location: "Philippines" },
  { slug: "santorini", name: "Santorini", location: "Greece" },
  { slug: "bora-bora", name: "Bora Bora", location: "French Polynesia" },
  { slug: "tanzania", name: "Tanzania", location: "Tanzania" },
  { slug: "sydney", name: "Sydney", location: "Australia" },
  { slug: "paris", name: "Paris", location: "France" },
  { slug: "chiang-mai", name: "Chiang Mai", location: "Thailand" },
  { slug: "maui", name: "Maui", location: "Hawaii, USA" },
  { slug: "barcelona", name: "Barcelona", location: "Spain" },
  { slug: "london", name: "London", location: "England" },
  { slug: "great-barrier-reef", name: "Great Barrier Reef", location: "Australia" },
  { slug: "cappadocia", name: "Cappadocia", location: "Turkey" },
  { slug: "petra", name: "Petra", location: "Jordan" },
  { slug: "istanbul", name: "Istanbul", location: "Turkey" },
  { slug: "glacier-national-park", name: "Glacier National Park", location: "Montana, USA" },
  { slug: "saint-lucia", name: "Saint Lucia", location: "Saint Lucia" },
  { slug: "yellowstone-national-park", name: "Yellowstone National Park", location: "Wyoming, USA" },
  { slug: "south-island-nz", name: "South Island", location: "New Zealand" },
  { slug: "maldives", name: "Maldives", location: "Maldives" },
  { slug: "quebec-city", name: "Quebec City", location: "Canada" },
  { slug: "banff", name: "Banff", location: "Canada" },
  { slug: "turks-and-caicos", name: "Turks & Caicos", location: "Turks & Caicos" }
];

export const popularDestinationSeeds: PopularDestination[] = popularDestinationNames.map((d) => ({
  ...d,
  imageUrl: placeholderImage(d.slug)
}));
