import "express";

// Lets req.user be used (and type-checked) anywhere after the auth
// middleware runs, instead of `any`-casting the request everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};
