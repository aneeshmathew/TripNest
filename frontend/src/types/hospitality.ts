import type { Continent } from "./listing";

export interface Hotel {
  id: string;
  name: string;
  description: string | null;
  location: string;
  continent: Continent;
  price: number;
  starClass: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  location: string;
  continent: Continent;
  cuisine: string;
  priceRange: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}
