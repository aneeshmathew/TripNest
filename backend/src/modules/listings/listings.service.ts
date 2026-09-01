import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { ListingsQuery } from "./listings.schemas.js";

// Case-insensitive substring matching (Prisma translates `mode: "insensitive"`
// to Postgres ILIKE) across title/location/description, plus price and
// rating range filters. This is intentionally not Postgres tsvector
// full-text search with ranking/GIN indexes — with a handful of listings,
// that would be solving a scale problem that doesn't exist yet. Revisit if
// the catalog grows enough for ILIKE scans or relevance ranking to matter.
export async function getAllListings(query: ListingsQuery = {}) {
  const where: Prisma.ListingWhereInput = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } }
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }

  if (query.minRating !== undefined) {
    where.averageRating = { gte: query.minRating };
  }

  if (query.continent) {
    where.continent = query.continent;
  }

  return prisma.listing.findMany({ where, orderBy: { createdAt: "asc" } });
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    throw new AppError(404, "Listing not found");
  }
  return listing;
}
