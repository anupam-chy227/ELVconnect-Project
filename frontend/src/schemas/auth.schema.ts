import { z } from "zod";
import { ELV_CATEGORIES } from "@/lib/config";

// Email validation pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const customerRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  profile: z.object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    companyName: z
      .string()
      .max(100, "Company name must be less than 100 characters")
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  }),
  industry: z.enum([
    "real_estate",
    "hospitality",
    "healthcare",
    "retail",
    "other",
  ]),
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City must be less than 100 characters"),
  country: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country must be less than 100 characters"),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const serviceProviderRegisterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(EMAIL_REGEX, "Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  profile: z.object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    companyName: z
      .string()
      .max(100, "Company name must be less than 100 characters")
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  }),
  serviceProvider: z.object({
    specializations: z
      .array(z.string())
      .min(1, "Select at least one specialization")
      .transform((vals) => vals.map((v) => v.toLowerCase().replace(/ /g, '_')))
      .pipe(z.array(z.enum(ELV_CATEGORIES))),
    yearsOfExperience: z
      .number()
      .min(0, "Years of experience cannot be negative")
      .optional(),
  }),
  licenseNumber: z.string().optional(),
  city: z
    .string()
    .min(2, "City is required")
    .max(100, "City must be less than 100 characters"),
  country: z
    .string()
    .min(2, "Country is required")
    .max(100, "Country must be less than 100 characters"),
  serviceRadius: z
    .number()
    .min(1, "Service radius must be at least 1 km")
    .max(200, "Service radius must be 200 km or less")
    .default(25),
  agreeToTerms: z
    .boolean()
    .refine((val) => val === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CustomerRegisterFormData = z.infer<typeof customerRegisterSchema>;
export type ServiceProviderRegisterFormData = z.infer<typeof serviceProviderRegisterSchema>;
