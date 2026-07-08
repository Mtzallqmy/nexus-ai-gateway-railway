import { z } from "zod";
export declare const createRoleSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodString>;
    permissionSlugs: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    permissionSlugs: string[];
    isDefault: boolean;
    organizationId?: string | null | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    organizationId?: string | null | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
    permissionSlugs?: string[] | undefined;
    isDefault?: boolean | undefined;
}>;
export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export declare const updateRoleSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    permissionSlugs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
    permissionSlugs?: string[] | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
    permissionSlugs?: string[] | undefined;
}>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export declare const listRolesQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    organizationId: z.ZodOptional<z.ZodString>;
    isSystem: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    search?: string | undefined;
    organizationId?: string | undefined;
    isSystem?: boolean | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    isSystem?: boolean | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type ListRolesQueryDto = z.infer<typeof listRolesQuerySchema>;
