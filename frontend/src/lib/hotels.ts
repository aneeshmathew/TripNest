import type { Hotel } from "../types/hospitality";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const REVALIDATE_SECONDS = 60;

export async function getHotels(search?: string): Promise<Hotel[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const response = await fetch(`${API_BASE_URL}/api/hotels${query}`, {
    next: { revalidate: REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    throw new Error(`Failed to load hotels (${response.status})`);
  }

  return response.json() as Promise<Hotel[]>;
}
