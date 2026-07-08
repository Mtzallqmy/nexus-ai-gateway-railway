import { z } from "zod";
export declare const createPermissionSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    resource: z.ZodString;
    actions: z.ZodArray<z.ZodString, "many">;
    group: z.ZodString;
    isSystem: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    resource: string;
    actions: string[];
    group: string;
    isSystem: boolean;
    description?: string | undefined;
}, {
    name: string;
    slug: string;
    resource: string;
    actions: string[];
    group: string;
    description?: string | undefined;
    isSystem?: boolean | undefined;
}>;
export type CreatePermissionDto = z.infer<typeof createPermissionSchema>;
export declare const listPermissionsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    resource: z.ZodOptional<z.ZodString>;
    group: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    search?: string | undefined;
    resource?: string | undefined;
    group?: string | undefined;
}, {
    search?: string | undefined;
    resource?: string | undefined;
    group?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type ListPermissionsQueryDto = z.infer<typeof listPermissionsQuerySchema>;
