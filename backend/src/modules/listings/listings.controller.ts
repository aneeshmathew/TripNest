import type { Request, Response } from "express";
import * as listingsService from "./listings.service.js";

export async function listListingsHandler(_req: Request, res: Response) {
  const listings = await listingsService.getAllListings();
  res.json(listings);
}

export async function getListingHandler(req: Request, res: Response) {
  const listing = await listingsService.getListingById(req.params.id);
  res.json(listing);
}
