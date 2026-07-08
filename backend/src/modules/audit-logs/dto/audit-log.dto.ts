import { z } from "zod";

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  actorId: z.string().uuid().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  status: z.enum(["SUCCESS", "FAILURE"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "action"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListAuditLogsQueryDto = z.infer<typeof listAuditLogsQuerySchema>;

export const createAuditLogSchema = z.object({
  action: z.string(),
  status: z.enum(["SUCCESS", "FAILURE"]),
  resource: z.string(),
  resourceId: z.string().optional(),
  resourceName: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;
