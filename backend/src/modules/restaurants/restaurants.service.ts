import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { RestaurantsQuery } from "./restaurants.schemas.js";

export async function getAllRestaurants(query: RestaurantsQuery = {}) {
  const where: Prisma.RestaurantWhereInput = {};

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

  if (query.cuisine) {
    where.cuisine = { contains: query.cuisine, mode: "insensitive" };
  }

  return prisma.restaurant.findMany({ where, orderBy: { createdAt: "asc" } });
}

export async function getRestaurantById(id: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { id } });
  if (!restaurant) {
    throw new AppError(404, "Restaurant not found");
  }
  return restaurant;
}
