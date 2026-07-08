"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSessionsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listSessionsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    userId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(["ACTIVE", "REVOKED", "EXPIRED"]).optional(),
});
//# sourceMappingURL=session.dto.js.map