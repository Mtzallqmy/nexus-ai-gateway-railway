"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSettingsQuerySchema = exports.upsertSettingSchema = void 0;
const zod_1 = require("zod");
exports.upsertSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1).max(200),
    value: zod_1.z.unknown(),
    type: zod_1.z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"]).default("JSON"),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().default("general"),
    isPublic: zod_1.z.boolean().default(false),
    organizationId: zod_1.z.string().uuid().nullable().optional(),
});
exports.listSettingsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(50),
    category: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().uuid().optional(),
    isPublic: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional(),
});
//# sourceMappingURL=setting.dto.js.map