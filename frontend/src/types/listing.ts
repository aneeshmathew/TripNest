// Mirrors the Prisma `Listing` model shape returned by the backend API.
// This is now the ONLY place listing shape is defined on the frontend —
// there is no more separate hardcoded frontend/src/data/apartments.js.
export interface Listing {
  id: string;
  title: string;
  description: string | null;
  location: string;
  price: number;
  averageRating: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = "Price" | "Average Rating" | "Title";
export type SortDirection = "asc" | "desc";
