import { Continent } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

function optionalCoercedNumber(constrain?: (schema: z.ZodNumber) => z.ZodNumber) {
  const numberSchema = constrain ? constrain(z.coerce.number()) : z.coerce.number();
  return z.preprocess(emptyToUndefined, numberSchema.optional());
}

export const hotelsQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  continent: z.preprocess(emptyToUndefined, z.nativeEnum(Continent).optional()),
  minPrice: optionalCoercedNumber((n) => n.nonnegative()),
  maxPrice: optionalCoercedNumber((n) => n.nonnegative())
});

export type HotelsQuery = z.infer<typeof hotelsQuerySchema>;
