import { z } from "zod";
export declare const createProjectSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
    teamId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    organizationId: string;
    slug?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    teamId?: string | undefined;
}, {
    name: string;
    organizationId: string;
    slug?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    teamId?: string | undefined;
}>;
export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export declare const updateProjectSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "ARCHIVED", "DELETED"]>>;
    teamId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED" | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    teamId?: string | null | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED" | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    teamId?: string | null | undefined;
}>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
export declare const listProjectsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    organizationId: z.ZodOptional<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "ARCHIVED", "DELETED"]>>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED" | undefined;
    teamId?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "ACTIVE" | "ARCHIVED" | "DELETED" | undefined;
    teamId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ListProjectsQueryDto = z.infer<typeof listProjectsQuerySchema>;
