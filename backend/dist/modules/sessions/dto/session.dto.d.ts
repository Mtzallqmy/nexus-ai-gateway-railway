import { z } from "zod";
export declare const listSessionsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "REVOKED", "EXPIRED"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    userId?: string | undefined;
}, {
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    userId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type ListSessionsQueryDto = z.infer<typeof listSessionsQuerySchema>;
