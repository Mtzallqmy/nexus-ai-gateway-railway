import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  organizationId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
  teamId: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  organizationId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListProjectsQueryDto = z.infer<typeof listProjectsQuerySchema>;
