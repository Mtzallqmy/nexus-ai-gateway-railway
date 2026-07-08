import { z } from "zod";
export declare const validateApiKeySchema: z.ZodObject<{
    providerName: z.ZodString;
    apiKey: z.ZodString;
    baseUrl: z.ZodOptional<z.ZodString>;
    modelToTest: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    providerName: string;
    baseUrl?: string | undefined;
    modelToTest?: string | undefined;
}, {
    apiKey: string;
    providerName: string;
    baseUrl?: string | undefined;
    modelToTest?: string | undefined;
}>;
export type ValidateApiKeyDto = z.infer<typeof validateApiKeySchema>;
export declare const discoverProviderSchema: z.ZodObject<{
    providerName: z.ZodString;
    apiKey: z.ZodString;
    baseUrl: z.ZodOptional<z.ZodString>;
    deep: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    providerName: string;
    deep: boolean;
    baseUrl?: string | undefined;
}, {
    apiKey: string;
    providerName: string;
    baseUrl?: string | undefined;
    deep?: boolean | undefined;
}>;
export type DiscoverProviderDto = z.infer<typeof discoverProviderSchema>;
export declare const listProvidersQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    type?: string | undefined;
    enabled?: boolean | undefined;
}, {
    search?: string | undefined;
    type?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "name" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    enabled?: boolean | undefined;
}>;
export type ListProvidersQueryDto = z.infer<typeof listProvidersQuerySchema>;
export declare const providerAnalyticsQuerySchema: z.ZodObject<{
    providerName: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    granularity: z.ZodDefault<z.ZodEnum<["hour", "day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    granularity: "hour" | "day" | "week" | "month";
    startDate?: string | undefined;
    endDate?: string | undefined;
    providerName?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    providerName?: string | undefined;
    granularity?: "hour" | "day" | "week" | "month" | undefined;
}>;
export type ProviderAnalyticsQueryDto = z.infer<typeof providerAnalyticsQuerySchema>;
export declare const providerLogsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "durationMs", "cost"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "createdAt" | "durationMs" | "cost";
    sortOrder: "asc" | "desc";
    status?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
}, {
    status?: number | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "createdAt" | "durationMs" | "cost" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
}>;
export type ProviderLogsQueryDto = z.infer<typeof providerLogsQuerySchema>;
