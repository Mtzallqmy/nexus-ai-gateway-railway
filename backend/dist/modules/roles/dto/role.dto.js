"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRolesQuerySchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/).optional(),
    description: zod_1.z.string().max(2000).optional(),
    organizationId: zod_1.z.string().uuid().nullable().optional(),
    color: zod_1.z.string().optional(),
    permissionSlugs: zod_1.z.array(zod_1.z.string()).default([]),
    isDefault: zod_1.z.boolean().default(false),
});
exports.updateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    description: zod_1.z.string().max(2000).optional(),
    color: zod_1.z.string().optional(),
    permissionSlugs: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.listRolesQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    organizationId: zod_1.z.string().uuid().optional(),
    isSystem: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=role.dto.js.map