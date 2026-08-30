import type { Request, Response } from "express";
import { AppError } from "../../middleware/errorHandler.js";
import * as authService from "./auth.service.js";
import { loginSchema, refreshSchema, signupSchema } from "./auth.schemas.js";

export async function signupHandler(req: Request, res: Response) {
  const input = signupSchema.parse(req.body);
  const result = await authService.signup(input);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.json(result);
}

export async function refreshHandler(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const result = await authService.refresh(refreshToken);
  res.json(result);
}

export async function logoutHandler(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);
  await authService.logout(refreshToken);
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError(401, "Not authenticated");
  }
  const user = await authService.getUserById(req.user.id);
  res.json({ user });
}
