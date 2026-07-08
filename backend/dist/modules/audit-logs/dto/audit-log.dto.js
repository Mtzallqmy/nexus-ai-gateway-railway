"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLogSchema = exports.listAuditLogsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listAuditLogsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(25),
    actorId: zod_1.z.string().uuid().optional(),
    action: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["SUCCESS", "FAILURE"]).optional(),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["createdAt", "action"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.createAuditLogSchema = zod_1.z.object({
    action: zod_1.z.string(),
    status: zod_1.z.enum(["SUCCESS", "FAILURE"]),
    resource: zod_1.z.string(),
    resourceId: zod_1.z.string().optional(),
    resourceName: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
//# sourceMappingURL=audit-log.dto.js.map