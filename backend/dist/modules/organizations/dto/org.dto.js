"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrgsQuerySchema = exports.updateOrgSchema = exports.createOrgSchema = void 0;
const zod_1 = require("zod");
exports.createOrgSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z
        .string()
        .min(2)
        .max(60)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
        .optional(),
    description: zod_1.z.string().max(2000).optional(),
    logoUrl: zod_1.z.string().url().optional(),
    plan: zod_1.z.enum(["free", "growth", "scale", "enterprise"]).default("free"),
});
exports.updateOrgSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(2000).optional(),
    logoUrl: zod_1.z.string().url().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
    plan: zod_1.z.enum(["free", "growth", "scale", "enterprise"]).optional(),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.listOrgsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
    sortBy: zod_1.z.enum(["createdAt", "name", "updatedAt"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
//# sourceMappingURL=org.dto.js.map