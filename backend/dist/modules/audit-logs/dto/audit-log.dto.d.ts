import { z } from "zod";
export declare const listAuditLogsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    actorId: z.ZodOptional<z.ZodString>;
    action: z.ZodOptional<z.ZodString>;
    resource: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["SUCCESS", "FAILURE"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "action"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "createdAt" | "action";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "SUCCESS" | "FAILURE" | undefined;
    resource?: string | undefined;
    action?: string | undefined;
    actorId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "SUCCESS" | "FAILURE" | undefined;
    resource?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "createdAt" | "action" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    action?: string | undefined;
    actorId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export type ListAuditLogsQueryDto = z.infer<typeof listAuditLogsQuerySchema>;
export declare const createAuditLogSchema: z.ZodObject<{
    action: z.ZodString;
    status: z.ZodEnum<["SUCCESS", "FAILURE"]>;
    resource: z.ZodString;
    resourceId: z.ZodOptional<z.ZodString>;
    resourceName: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: "SUCCESS" | "FAILURE";
    resource: string;
    action: string;
    organizationId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    resourceId?: string | undefined;
    resourceName?: string | undefined;
}, {
    status: "SUCCESS" | "FAILURE";
    resource: string;
    action: string;
    organizationId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    resourceId?: string | undefined;
    resourceName?: string | undefined;
}>;
export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;
