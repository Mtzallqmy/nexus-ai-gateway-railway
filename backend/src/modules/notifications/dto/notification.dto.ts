import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).default("INFO"),
  channel: z.enum(["IN_APP", "EMAIL", "PUSH", "WEBHOOK"]).default("IN_APP"),
  category: z.string().default("general"),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  scheduledFor: z.string().datetime().optional(),
});
export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  read: z.boolean().optional(),
  category: z.string().optional(),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).optional(),
});
export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>;
