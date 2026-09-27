import type { Hotel } from "../types/hospitality";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const REVALIDATE_SECONDS = 60;

// Bounds how long a single request can hang — see the identical constant
// in lib/listings.ts for why this matters (a slow/stuck backend would
// otherwise stall the whole page navigation indefinitely).
const FETCH_TIMEOUT_MS = 8_000;

export async function getHotels(search?: string): Promise<Hotel[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/hotels${query}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Failed to load hotels (${response.status})`);
  }

  return response.json() as Promise<Hotel[]>;
}
