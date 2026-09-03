import type { Restaurant } from "../types/hospitality";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const REVALIDATE_SECONDS = 60;

export async function getRestaurants(search?: string): Promise<Restaurant[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/restaurants${query}`, {
    next: { revalidate: REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`Failed to load restaurants (${response.status})`);
  }

  return response.json() as Promise<Restaurant[]>;
}
