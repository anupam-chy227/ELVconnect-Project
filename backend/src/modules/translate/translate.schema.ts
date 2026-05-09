import { z } from 'zod';

export const translateBatchBodySchema = z.object({
  targetLanguage: z.string().trim().min(2).max(16),
  sourceLanguage: z.string().trim().min(2).max(16).default('en'),
  texts: z.array(z.string().max(1000)).min(1).max(120),
});

export const translateBatchSchema = z.object({
  body: translateBatchBodySchema,
});

export type TranslateBatchInput = z.infer<typeof translateBatchBodySchema>;
