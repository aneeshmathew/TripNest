import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createReviewHandler,
  deleteReviewHandler,
  listReviewsHandler,
  updateReviewHandler
} from "./reviews.controller.js";

// Mounted at /api/listings/:listingId/reviews — mergeParams so
// req.params.listingId (from the parent route) is visible in the
// controller/service layer.
export const listingReviewsRouter = Router({ mergeParams: true });
listingReviewsRouter.get("/", asyncHandler(listReviewsHandler));
listingReviewsRouter.post("/", requireAuth, asyncHandler(createReviewHandler));

// Mounted at /api/reviews — editing/deleting a specific review doesn't
// need the listing in the path, just the review's own id.
export const reviewsRouter = Router();
reviewsRouter.patch("/:id", requireAuth, asyncHandler(updateReviewHandler));
reviewsRouter.delete("/:id", requireAuth, asyncHandler(deleteReviewHandler));
