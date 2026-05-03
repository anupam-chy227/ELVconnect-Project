import { z } from "zod";
import { ELV_CATEGORIES } from "@/lib/config";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
  category: z
    .array(z.enum(ELV_CATEGORIES))
    .min(1, "Select at least one category"),
  visibility: z.enum(["public", "invite_only"]),
  budget: z.object({
    type: z.enum(["fixed", "range", "get_quotes"]),
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().optional(),
  }),
  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    country: z.string().min(2, "Country is required"),
  }),
  timeline: z.object({
    startDate: z.string().min(1, "Start date is required"),
    deadline: z.string().min(1, "Deadline is required"),
  }),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;
