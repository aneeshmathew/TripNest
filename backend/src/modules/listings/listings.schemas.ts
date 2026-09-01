import { Continent } from "@prisma/client";
import { z } from "zod";

// Empty-string query params are common from GET forms with blank fields
// (e.g. `?search=&minPrice=`) — treat them as "not provided" rather than
// letting z.coerce.number() turn "" into 0 and incorrectly filter on it.
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

function optionalCoercedNumber(constrain?: (schema: z.ZodNumber) => z.ZodNumber) {
  const numberSchema = constrain ? constrain(z.coerce.number()) : z.coerce.number();
  return z.preprocess(emptyToUndefined, numberSchema.optional());
}

export const listingsQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  minPrice: optionalCoercedNumber((n) => n.nonnegative()),
  maxPrice: optionalCoercedNumber((n) => n.nonnegative()),
  minRating: optionalCoercedNumber((n) => n.min(0).max(5)),
  continent: z.preprocess(emptyToUndefined, z.nativeEnum(Continent).optional())
});

export type ListingsQuery = z.infer<typeof listingsQuerySchema>;
