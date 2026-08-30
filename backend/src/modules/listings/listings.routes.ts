import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getListingHandler, listListingsHandler } from "./listings.controller.js";

export const listingsRouter = Router();

// Intentionally public/unauthenticated: browsing listings is core discovery
// content and needs to be crawlable by search engines (see README.md,
// Phase 1 — SEO). Only mutating listing data (Phase 1+: create/update as an
// owner) should require auth.
listingsRouter.get("/", asyncHandler(listListingsHandler));
listingsRouter.get("/:id", asyncHandler(getListingHandler));
