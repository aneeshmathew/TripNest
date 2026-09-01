// Server-only data fetching for listings — used from Server Components
// (app/page.tsx, app/apartments/[id]/page.tsx) so listing content is
// rendered into the initial HTML for SEO/crawlability, instead of being
// fetched client-side after the page loads.
//
// Deliberately separate from src/api/ (which is client-only and handles
// auth/localStorage) — these fetches carry no auth token, since browsing
// listings is public.
import type { Listing } from "../types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

// Revalidate every 60s (ISR): listing data is served from cache and
// refreshed in the background at most once a minute, rather than hitting
// the backend on every request or going fully static. Different filter
// combinations are cached separately since they produce different URLs.
const REVALIDATE_SECONDS = 60;

// Values as they arrive from Next's `searchParams` (always strings, or
// undefined/empty when a form field was left blank) — the backend's zod
// schema (listings.schemas.ts) handles coercion and treats "" as unset.
export interface ListingFilters {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  continent?: string;
}

function buildQueryString(filters: ListingFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.minRating) params.set("minRating", filters.minRating);
  if (filters.continent) params.set("continent", filters.continent);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/api/listings${buildQueryString(filters)}`, {
    next: { revalidate: REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`Failed to load listings (${response.status})`);
  }

  return response.json() as Promise<Listing[]>;
}

export async function getListing(id: string): Promise<Listing | null> {
  const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load listing ${id} (${response.status})`);
  }

  return response.json() as Promise<Listing>;
}

export async function getListingIds(): Promise<string[]> {
  const listings = await getListings();
  return listings.map((listing) => listing.id);
}

// Powers the homepage "Featured Stays" row — real listings, highest-rated
// first, not fabricated "activity category" cards. No dedicated backend
// endpoint for this; with the current catalog size, fetching everything
// and sorting/slicing here is simpler than adding a sort/limit param to
// the listings API for a single homepage row.
export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  const listings = await getListings();
  return [...listings].sort((a, b) => b.averageRating - a.averageRating).slice(0, limit);
}
