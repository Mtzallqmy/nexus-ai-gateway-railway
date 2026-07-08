import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9:._-]+$/),
  description: z.string().max(2000).optional(),
  resource: z.string(),
  actions: z.array(z.string()).min(1),
  group: z.string(),
  isSystem: z.boolean().default(false),
});
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;

export const listPermissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  resource: z.string().optional(),
  group: z.string().optional(),
  search: z.string().optional(),
});
export type ListPermissionsQueryDto = z.infer<typeof listPermissionsQuerySchema>;
