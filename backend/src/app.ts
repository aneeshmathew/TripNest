import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { listingsRouter } from "./modules/listings/listings.routes.js";
import { listingReviewsRouter, reviewsRouter } from "./modules/reviews/reviews.routes.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/listings", listingsRouter);
  app.use("/api/listings/:listingId/reviews", listingReviewsRouter);
  app.use("/api/reviews", reviewsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
