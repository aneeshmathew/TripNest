import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

export async function getAllListings() {
  return prisma.listing.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) {
    throw new AppError(404, "Listing not found");
  }
  return listing;
}
