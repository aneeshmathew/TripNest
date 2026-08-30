import { z } from "zod";

const ratingScale = z.number().int().min(1).max(5);

export const createReviewSchema = z.object({
  rating: ratingScale,
  title: z.string().trim().min(1, "Title is required").max(120),
  body: z.string().trim().min(1, "Review text is required").max(4000),
  cleanliness: ratingScale.optional(),
  service: ratingScale.optional(),
  value: ratingScale.optional(),
  location: ratingScale.optional(),
  // Hosted photo URLs only — see ReviewPhoto comment in schema.prisma.
  photoUrls: z.array(z.string().url()).max(10).optional()
});

// All fields optional on update — a PATCH may touch just the rating, just
// the text, etc. photoUrls intentionally excluded from update: adding/
// removing individual photos is a separate concern from editing review
// text, and isn't needed yet since photo upload itself isn't built.
export const updateReviewSchema = createReviewSchema.omit({ photoUrls: true }).partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
