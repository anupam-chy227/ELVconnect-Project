import { z } from 'zod';

export const ELVCategoryEnum = z.enum([
  'cctv', 'access_control', 'fire_alarm', 'structured_cabling',
  'pa_system', 'bms', 'intercom', 'gate_automation', 'av_integration', 'other',
]);

export const registerCustomerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    companyName: z.string().min(2).max(100).optional(),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    password: z.string().min(8).max(128),
    industry: z.enum(['real_estate', 'hospitality', 'healthcare', 'retail', 'other']),
    city: z.string().min(2).max(100),
    country: z.string().min(2).max(100).default('UAE'),
  }),
});

export const registerServiceProviderSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100),
    companyName: z.string().min(2).max(100).optional(),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    password: z.string().min(8).max(128),
    specializations: z.array(ELVCategoryEnum).min(1),
    yearsOfExperience: z.number().int().min(0).max(50),
    licenseNumber: z.string().optional(),
    city: z.string().min(2).max(100),
    country: z.string().min(2).max(100).default('UAE'),
    serviceRadius: z.number().int().min(1).max(200).default(25),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const googleAuthSchema = z.object({
  body: z.object({
    credential: z.string().min(1),
    role: z.enum(['customer', 'service_provider']).default('customer'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  }),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>['body'];
export type RegisterServiceProviderInput = z.infer<typeof registerServiceProviderSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>['body'];
