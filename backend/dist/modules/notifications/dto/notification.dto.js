"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotificationsQuerySchema = exports.createNotificationSchema = void 0;
const zod_1 = require("zod");
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(200),
    message: zod_1.z.string().min(1).max(5000),
    type: zod_1.z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).default("INFO"),
    channel: zod_1.z.enum(["IN_APP", "EMAIL", "PUSH", "WEBHOOK"]).default("IN_APP"),
    category: zod_1.z.string().default("general"),
    actionUrl: zod_1.z.string().optional(),
    actionLabel: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    scheduledFor: zod_1.z.string().datetime().optional(),
});
exports.listNotificationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    userId: zod_1.z.string().uuid().optional(),
    read: zod_1.z.boolean().optional(),
    category: zod_1.z.string().optional(),
    type: zod_1.z.enum(["INFO", "SUCCESS", "WARNING", "ERROR"]).optional(),
});
//# sourceMappingURL=notification.dto.js.map