import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler.js";
import * as reviewsService from "./reviews.service.js";
import { createReviewSchema, updateReviewSchema } from "./reviews.schemas.js";

export async function listReviewsHandler(req: Request, res: Response) {
  const reviews = await reviewsService.listReviewsForListing(req.params.listingId);
  res.json(reviews);
}

export async function createReviewHandler(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }
  const input = createReviewSchema.parse(req.body);
  const review = await reviewsService.createReview(req.params.listingId, req.user.id, input);
  res.status(201).json(review);
}

export async function updateReviewHandler(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }
  const input = updateReviewSchema.parse(req.body);
  const review = await reviewsService.updateReview(req.params.id, req.user.id, input);
  res.json(review);
}

export async function deleteReviewHandler(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }
  await reviewsService.deleteReview(req.params.id, req.user.id);
  res.status(204).send();
}
