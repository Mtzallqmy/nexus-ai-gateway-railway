import { z } from "zod";

// ============================================================
// PROVIDER DTOs
// ============================================================

export const validateApiKeySchema = z.object({
  providerName: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  modelToTest: z.string().optional(),
});
export type ValidateApiKeyDto = z.infer<typeof validateApiKeySchema>;

export const discoverProviderSchema = z.object({
  providerName: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional(),
  deep: z.boolean().optional().default(false),
});
export type DiscoverProviderDto = z.infer<typeof discoverProviderSchema>;

export const listProvidersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  type: z.string().optional(),
  enabled: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
export type ListProvidersQueryDto = z.infer<typeof listProvidersQuerySchema>;

export const providerAnalyticsQuerySchema = z.object({
  providerName: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(["hour", "day", "week", "month"]).default("day"),
});
export type ProviderAnalyticsQueryDto = z.infer<typeof providerAnalyticsQuerySchema>;

export const providerLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  status: z.number().int().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "durationMs", "cost"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ProviderLogsQueryDto = z.infer<typeof providerLogsQuerySchema>;

// ============================================================
// DYNAMIC PROVIDER MANAGEMENT
// ============================================================

/**
 * Schema used to validate requests to create a new provider. Only the
 * fields defined here are accepted by the controller. The `name` and
 * `baseUrl` fields are required; all others are optional.
 */
export const createProviderSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseUrl: z.string().min(1),
  region: z.string().optional(),
});
export type CreateProviderDto = z.infer<typeof createProviderSchema>;

/**
 * Schema used to validate provider update requests. At least one field
 * must be provided. A partial update is allowed so all fields are
 * optional here.
 */
export const updateProviderSchema = createProviderSchema.partial();
export type UpdateProviderDto = z.infer<typeof updateProviderSchema>;

/**
 * Empty schema used for testConnection requests. This is intentionally
 * left empty because the endpoint expects only the provider ID in the
 * URL path.
 */
export const testConnectionSchema = z.object({});
