import { z } from "zod";
export declare const upsertSettingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodUnknown;
    type: z.ZodDefault<z.ZodEnum<["STRING", "NUMBER", "BOOLEAN", "JSON"]>>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodDefault<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    organizationId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    isPublic: boolean;
    type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON";
    category: string;
    key: string;
    organizationId?: string | null | undefined;
    value?: unknown;
    description?: string | undefined;
}, {
    key: string;
    isPublic?: boolean | undefined;
    type?: "STRING" | "NUMBER" | "BOOLEAN" | "JSON" | undefined;
    organizationId?: string | null | undefined;
    value?: unknown;
    description?: string | undefined;
    category?: string | undefined;
}>;
export type UpsertSettingDto = z.infer<typeof upsertSettingSchema>;
export declare const listSettingsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    isPublic?: boolean | undefined;
    search?: string | undefined;
    organizationId?: string | undefined;
    category?: string | undefined;
}, {
    isPublic?: boolean | undefined;
    search?: string | undefined;
    organizationId?: string | undefined;
    category?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export type ListSettingsQueryDto = z.infer<typeof listSettingsQuerySchema>;
