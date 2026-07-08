import { z } from "zod";
export declare const createApiKeySchema: z.ZodObject<{
    name: z.ZodString;
    scopes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    rateLimitRps: z.ZodOptional<z.ZodNumber>;
    expiresAt: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scopes: string[];
    usageLimit?: number | undefined;
    organizationId?: string | undefined;
    expiresAt?: string | undefined;
    rateLimitRps?: number | undefined;
    projectId?: string | undefined;
}, {
    name: string;
    usageLimit?: number | undefined;
    organizationId?: string | undefined;
    expiresAt?: string | undefined;
    scopes?: string[] | undefined;
    rateLimitRps?: number | undefined;
    projectId?: string | undefined;
}>;
export type CreateApiKeyDto = z.infer<typeof createApiKeySchema>;
export declare const listApiKeysQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    userId: z.ZodOptional<z.ZodString>;
    organizationId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["ACTIVE", "REVOKED", "EXPIRED"]>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    userId?: string | undefined;
    projectId?: string | undefined;
}, {
    search?: string | undefined;
    organizationId?: string | undefined;
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    userId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    projectId?: string | undefined;
}>;
export type ListApiKeysQueryDto = z.infer<typeof listApiKeysQuerySchema>;
export interface CreateApiKeyResult {
    id: string;
    key: string;
    maskedKey: string;
    name: string;
    scopes: string[];
    expiresAt: string | null;
    createdAt: string;
}
