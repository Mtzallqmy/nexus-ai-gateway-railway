"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listApiKeysQuerySchema = exports.createApiKeySchema = void 0;
const zod_1 = require("zod");
exports.createApiKeySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    scopes: zod_1.z.array(zod_1.z.string()).default([]),
    usageLimit: zod_1.z.number().int().positive().optional(),
    rateLimitRps: zod_1.z.number().int().positive().optional(),
    expiresAt: zod_1.z.string().datetime().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid().optional(),
});
exports.listApiKeysQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    userId: zod_1.z.string().uuid().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    projectId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["ACTIVE", "REVOKED", "EXPIRED"]).optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=api-key.dto.js.map