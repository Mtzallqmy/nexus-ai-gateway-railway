import { z } from "zod";
export declare const createTeamSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    organizationId: string;
    slug?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    organizationId: string;
    slug?: string | undefined;
    description?: string | undefined;
}>;
export type CreateTeamDto = z.infer<typeof createTeamSchema>;
export declare const updateTeamSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "INACTIVE"]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
    description?: string | undefined;
}, {
    name?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
    description?: string | undefined;
}>;
export type UpdateTeamDto = z.infer<typeof updateTeamSchema>;
export declare const listTeamsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    organizationId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "name"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "createdAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    organizationId?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "createdAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ListTeamsQueryDto = z.infer<typeof listTeamsQuerySchema>;
