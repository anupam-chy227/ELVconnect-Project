import { z } from 'zod';

const ELVCategoryEnum = z.enum([
  'cctv','access_control','fire_alarm','structured_cabling',
  'pa_system','bms','intercom','gate_automation','av_integration','other',
]);

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(5000),
    category: z.array(ELVCategoryEnum).min(1),
    visibility: z.enum(['public','invite_only']).default('public'),
    budget: z.object({
      type: z.enum(['fixed','range','get_quotes']),
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default('AED'),
    }),
    location: z.object({
      address: z.string().min(1),
      city: z.string().min(1),
      country: z.string().default('UAE'),
      coordinates: z.tuple([z.number(), z.number()]), // [lng, lat]
    }),
    timeline: z.object({
      startDate: z.string().datetime().optional(),
      deadline: z.string().datetime().optional(),
    }).optional(),
  }),
});

export const applyToJobSchema = z.object({
  body: z.object({
    coverNote: z.string().max(1000).optional(),
    proposedAmount: z.number().positive().optional(),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    applicationId: z.string().min(1),
    status: z.enum(['shortlisted','accepted','rejected']),
  }),
  params: z.object({ id: z.string().min(1) }),
});

export const jobQuerySchema = z.object({
  query: z.object({
    lat: z.string().optional(),
    lng: z.string().optional(),
    radius: z.string().optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
