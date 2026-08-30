import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  signupHandler
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/signup", asyncHandler(signupHandler));
authRouter.post("/login", asyncHandler(loginHandler));
authRouter.post("/refresh", asyncHandler(refreshHandler));
authRouter.post("/logout", asyncHandler(logoutHandler));
authRouter.get("/me", requireAuth, asyncHandler(meHandler));
