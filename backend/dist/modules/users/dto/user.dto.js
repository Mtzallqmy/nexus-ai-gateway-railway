"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    name: zod_1.z.string().min(2).max(100),
    password: zod_1.z
        .string()
        .min(8)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/)
        .optional(),
    jobTitle: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(2000).optional(),
    website: zod_1.z.string().url().optional(),
    role: zod_1.z.string().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100).optional(),
    jobTitle: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    bio: zod_1.z.string().max(2000).optional(),
    website: zod_1.z.string().url().optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
});
exports.listUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
    sortBy: zod_1.z.enum(["createdAt", "name", "email", "lastLoginAt"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
//# sourceMappingURL=user.dto.js.map