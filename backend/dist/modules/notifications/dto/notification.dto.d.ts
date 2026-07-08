import { z } from "zod";
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["INFO", "SUCCESS", "WARNING", "ERROR"]>>;
    channel: z.ZodDefault<z.ZodEnum<["IN_APP", "EMAIL", "PUSH", "WEBHOOK"]>>;
    category: z.ZodDefault<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    actionLabel: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
    title: string;
    channel: "IN_APP" | "EMAIL" | "PUSH" | "WEBHOOK";
    category: string;
    userId: string;
    actionUrl?: string | undefined;
    actionLabel?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    scheduledFor?: string | undefined;
}, {
    message: string;
    title: string;
    userId: string;
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | undefined;
    channel?: "IN_APP" | "EMAIL" | "PUSH" | "WEBHOOK" | undefined;
    category?: string | undefined;
    actionUrl?: string | undefined;
    actionLabel?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    scheduledFor?: string | undefined;
}>;
export type CreateNotificationDto = z.infer<typeof createNotificationSchema>;
export declare const listNotificationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    read: z.ZodOptional<z.ZodBoolean>;
    category: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["INFO", "SUCCESS", "WARNING", "ERROR"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | undefined;
    category?: string | undefined;
    read?: boolean | undefined;
    userId?: string | undefined;
}, {
    type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | undefined;
    category?: string | undefined;
    read?: boolean | undefined;
    userId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>;
