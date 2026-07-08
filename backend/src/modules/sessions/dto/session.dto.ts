import { z } from "zod";

export const listSessionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "REVOKED", "EXPIRED"]).optional(),
});
export type ListSessionsQueryDto = z.infer<typeof listSessionsQuerySchema>;
