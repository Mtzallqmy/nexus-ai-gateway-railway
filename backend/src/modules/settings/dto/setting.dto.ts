import { z } from "zod";

export const upsertSettingSchema = z.object({
  key: z.string().min(1).max(200),
  value: z.unknown(),
  type: z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"]).default("JSON"),
  description: z.string().optional(),
  category: z.string().default("general"),
  isPublic: z.boolean().default(false),
  organizationId: z.string().uuid().nullable().optional(),
});
export type UpsertSettingDto = z.infer<typeof upsertSettingSchema>;

export const listSettingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  category: z.string().optional(),
  organizationId: z.string().uuid().optional(),
  isPublic: z.boolean().optional(),
  search: z.string().optional(),
});
export type ListSettingsQueryDto = z.infer<typeof listSettingsQuerySchema>;
