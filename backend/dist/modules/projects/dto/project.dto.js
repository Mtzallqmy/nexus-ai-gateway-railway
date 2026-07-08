"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjectsQuerySchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: zod_1.z.string().max(2000).optional(),
    organizationId: zod_1.z.string().uuid(),
    teamId: zod_1.z.string().uuid().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.updateProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(2000).optional(),
    status: zod_1.z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
    teamId: zod_1.z.string().uuid().nullable().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.listProjectsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    organizationId: zod_1.z.string().uuid().optional(),
    teamId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["ACTIVE", "ARCHIVED", "DELETED"]).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["createdAt", "name", "updatedAt"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
//# sourceMappingURL=project.dto.js.map