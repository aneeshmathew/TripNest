import { apiFetch } from "./client";
import type { Listing } from "../types/listing";

export function fetchListings(): Promise<Listing[]> {
  // auth: false — listing browsing is public (see backend listings.routes.ts).
  return apiFetch<Listing[]>("/api/listings", { auth: false });
}

export function fetchListing(id: string): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${id}`, { auth: false });
}
