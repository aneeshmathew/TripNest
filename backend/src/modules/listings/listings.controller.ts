import type { Request, Response } from "express";
import * as listingsService from "./listings.service.js";
import { listingsQuerySchema } from "./listings.schemas.js";

export async function listListingsHandler(req: Request, res: Response) {
  const query = listingsQuerySchema.parse(req.query);
  const listings = await listingsService.getAllListings(query);
  res.json(listings);
}

export async function getListingHandler(req: Request, res: Response) {
  const listing = await listingsService.getListingById(req.params.id);
  res.json(listing);
}
