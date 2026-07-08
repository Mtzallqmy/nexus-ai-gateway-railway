"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginResponseSchema = void 0;
const zod_1 = require("zod");
exports.loginResponseSchema = zod_1.z.object({
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string(),
    expiresIn: zod_1.z.number(),
    tokenType: zod_1.z.literal("Bearer"),
    user: zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        name: zod_1.z.string(),
        avatarUrl: zod_1.z.string().nullable().optional(),
        role: zod_1.z.string().optional(),
        permissions: zod_1.z.array(zod_1.z.string()),
        emailVerified: zod_1.z.boolean(),
        twoFactorEnabled: zod_1.z.boolean(),
    }),
});
//# sourceMappingURL=auth-response.dto.js.map