// Server-only data fetching for listings — used from Server Components
// (app/page.tsx, app/apartments/[id]/page.tsx) so listing content is
// rendered into the initial HTML for SEO/crawlability, instead of being
// fetched client-side after the page loads.
//
// Deliberately separate from src/api/ (which is client-only and handles
// auth/localStorage) — these fetches carry no auth token, since browsing
// listings is public.
import type { Listing } from "../types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// Revalidate every 60s (ISR): listing data is served from cache and
// refreshed in the background at most once a minute, rather than hitting
// the backend on every request or going fully static.
const REVALIDATE_SECONDS = 60;

export async function getListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/api/listings`, {
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
