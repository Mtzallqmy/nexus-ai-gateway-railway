import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  plan: z.enum(["free", "growth", "scale", "enterprise"]).default("free"),
});
export type CreateOrgDto = z.infer<typeof createOrgSchema>;

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  plan: z.enum(["free", "growth", "scale", "enterprise"]).optional(),
  settings: z.record(z.unknown()).optional(),
});
export type UpdateOrgDto = z.infer<typeof updateOrgSchema>;

export const listOrgsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListOrgsQueryDto = z.infer<typeof listOrgsQuerySchema>;
