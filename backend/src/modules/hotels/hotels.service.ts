import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { HotelsQuery } from "./hotels.schemas.js";

export async function getAllHotels(query: HotelsQuery = {}) {
  const where: Prisma.HotelWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } }
    ];
  }

  if (query.continent) {
    where.continent = query.continent;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }

  return prisma.hotel.findMany({ where, orderBy: { createdAt: "asc" } });
}

export async function getHotelById(id: string) {
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) {
    throw new AppError(404, "Hotel not found");
  }
  return hotel;
}
