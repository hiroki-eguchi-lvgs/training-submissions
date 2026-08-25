import { z } from 'zod';

export const articlesQuerySchema = z.object({
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(10).optional().default(10),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type ArticlesQuery = z.infer<typeof articlesQuerySchema>;
