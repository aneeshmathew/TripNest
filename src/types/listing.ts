// Mirrors the Prisma `Listing` model shape returned by the backend API.
// This is now the ONLY place listing shape is defined on the frontend —
// there is no more separate hardcoded frontend/src/data/apartments.js.

// Matches the backend's Continent enum (schema.prisma). Used by the
// continent map — a coarse click-to-filter selector, not real geo data.
export type Continent =
  | "NORTH_AMERICA"
  | "SOUTH_AMERICA"
  | "EUROPE"
  | "AFRICA"
  | "ASIA"
  | "OCEANIA";

export interface Listing {
  id: string;
  title: string;
  description: string | null;
  location: string;
  continent: Continent;
  price: number;
  averageRating: number;
  reviewCount: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
