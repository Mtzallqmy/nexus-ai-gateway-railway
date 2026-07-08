import { z } from "zod";

export const createRoleSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  organizationId: z.string().uuid().nullable().optional(),
  color: z.string().optional(),
  permissionSlugs: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
});
export type CreateRoleDto = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  color: z.string().optional(),
  permissionSlugs: z.array(z.string()).optional(),
});
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;

export const listRolesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  organizationId: z.string().uuid().optional(),
  isSystem: z.boolean().optional(),
  search: z.string().optional(),
});
export type ListRolesQueryDto = z.infer<typeof listRolesQuerySchema>;
