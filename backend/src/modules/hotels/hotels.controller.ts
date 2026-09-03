import type { Request, Response } from "express";
import * as hotelsService from "./hotels.service.js";
import { hotelsQuerySchema } from "./hotels.schemas.js";

export async function listHotelsHandler(req: Request, res: Response) {
  const query = hotelsQuerySchema.parse(req.query);
  const hotels = await hotelsService.getAllHotels(query);
  res.json(hotels);
}

export async function getHotelHandler(req: Request, res: Response) {
  const hotel = await hotelsService.getHotelById(req.params.id);
  res.json(hotel);
}
