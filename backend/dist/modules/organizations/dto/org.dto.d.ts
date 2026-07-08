import { z } from "zod";
export declare const createOrgSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    plan: z.ZodDefault<z.ZodEnum<["free", "growth", "scale", "enterprise"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    plan: "free" | "growth" | "scale" | "enterprise";
    slug?: string | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
}, {
    name: string;
    slug?: string | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
    plan?: "free" | "growth" | "scale" | "enterprise" | undefined;
}>;
export type CreateOrgDto = z.infer<typeof createOrgSchema>;
export declare const updateOrgSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>>;
    plan: z.ZodOptional<z.ZodEnum<["free", "growth", "scale", "enterprise"]>>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
    plan?: "free" | "growth" | "scale" | "enterprise" | undefined;
    settings?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    description?: string | undefined;
    logoUrl?: string | undefined;
    plan?: "free" | "growth" | "scale" | "enterprise" | undefined;
    settings?: Record<string, unknown> | undefined;
}>;
export type UpdateOrgDto = z.infer<typeof updateOrgSchema>;
export declare const listOrgsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE", "SUSPENDED"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
}, {
    search?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ListOrgsQueryDto = z.infer<typeof listOrgsQuerySchema>;
