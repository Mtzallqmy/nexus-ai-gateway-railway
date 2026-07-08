"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerLogsQuerySchema = exports.providerAnalyticsQuerySchema = exports.listProvidersQuerySchema = exports.discoverProviderSchema = exports.validateApiKeySchema = void 0;
const zod_1 = require("zod");
exports.validateApiKeySchema = zod_1.z.object({
    providerName: zod_1.z.string().min(1),
    apiKey: zod_1.z.string().min(1),
    baseUrl: zod_1.z.string().url().optional(),
    modelToTest: zod_1.z.string().optional(),
});
exports.discoverProviderSchema = zod_1.z.object({
    providerName: zod_1.z.string().min(1),
    apiKey: zod_1.z.string().min(1),
    baseUrl: zod_1.z.string().url().optional(),
    deep: zod_1.z.boolean().optional().default(false),
});
exports.listProvidersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    search: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(["name", "createdAt", "updatedAt"]).default("name"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("asc"),
});
exports.providerAnalyticsQuerySchema = zod_1.z.object({
    providerName: zod_1.z.string().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    granularity: zod_1.z.enum(["hour", "day", "week", "month"]).default("day"),
});
exports.providerLogsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    status: zod_1.z.number().int().optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(["createdAt", "durationMs", "cost"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
//# sourceMappingURL=provider.dto.js.map