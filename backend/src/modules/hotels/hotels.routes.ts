import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getHotelHandler, listHotelsHandler } from "./hotels.controller.js";

export const hotelsRouter = Router();
// Public — browsing hotels needs no auth, same reasoning as listings.
hotelsRouter.get("/", asyncHandler(listHotelsHandler));
hotelsRouter.get("/:id", asyncHandler(getHotelHandler));
