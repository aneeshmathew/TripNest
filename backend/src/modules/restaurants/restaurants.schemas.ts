import { Continent } from "@prisma/client";
import { z } from "zod";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

export const restaurantsQuerySchema = z.object({
  search: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  continent: z.preprocess(emptyToUndefined, z.nativeEnum(Continent).optional()),
  cuisine: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional())
});

export type RestaurantsQuery = z.infer<typeof restaurantsQuerySchema>;
