import { z } from 'zod';

export const locationMatchQuerySchema = z.object({
  query: z.object({
    city: z.string().trim().max(120).optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
    category: z.string().trim().max(80).optional(),
    limit: z.string().optional(),
  }),
});
