import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getRestaurantHandler, listRestaurantsHandler } from "./restaurants.controller.js";

export const restaurantsRouter = Router();
// Public — browsing restaurants needs no auth, same reasoning as listings.
restaurantsRouter.get("/", asyncHandler(listRestaurantsHandler));
restaurantsRouter.get("/:id", asyncHandler(getRestaurantHandler));
