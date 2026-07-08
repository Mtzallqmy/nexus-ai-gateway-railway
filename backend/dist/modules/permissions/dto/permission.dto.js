"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPermissionsQuerySchema = exports.createPermissionSchema = void 0;
const zod_1 = require("zod");
exports.createPermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    slug: zod_1.z.string().regex(/^[a-z0-9:._-]+$/),
    description: zod_1.z.string().max(2000).optional(),
    resource: zod_1.z.string(),
    actions: zod_1.z.array(zod_1.z.string()).min(1),
    group: zod_1.z.string(),
    isSystem: zod_1.z.boolean().default(false),
});
exports.listPermissionsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(50),
    resource: zod_1.z.string().optional(),
    group: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=permission.dto.js.map