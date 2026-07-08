import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(2).max(100),
  scopes: z.array(z.string()).default([]),
  usageLimit: z.number().int().positive().optional(),
  rateLimitRps: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  organizationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
});
export type CreateApiKeyDto = z.infer<typeof createApiKeySchema>;

export const listApiKeysQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]).optional(),
  search: z.string().optional(),
});
export type ListApiKeysQueryDto = z.infer<typeof listApiKeysQuerySchema>;

export interface CreateApiKeyResult {
  id: string;
  key: string; // only returned once
  maskedKey: string;
  name: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
}
