import type { Request, Response } from "express";
import * as restaurantsService from "./restaurants.service.js";
import { restaurantsQuerySchema } from "./restaurants.schemas.js";

export async function listRestaurantsHandler(req: Request, res: Response) {
  const query = restaurantsQuerySchema.parse(req.query);
  const restaurants = await restaurantsService.getAllRestaurants(query);
  res.json(restaurants);
}

export async function getRestaurantHandler(req: Request, res: Response) {
  const restaurant = await restaurantsService.getRestaurantById(req.params.id);
  res.json(restaurant);
}
