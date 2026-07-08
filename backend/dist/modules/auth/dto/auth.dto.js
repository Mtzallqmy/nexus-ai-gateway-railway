"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disable2faSchema = exports.verify2faSchema = exports.enable2faSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(100),
    email: zod_1.z.string().email("Invalid email format").toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128)
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[0-9]/, "Password must contain a number"),
    company: zod_1.z.string().optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
    password: zod_1.z.string().min(1),
    rememberMe: zod_1.z.boolean().optional().default(false),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Refresh token required"),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/),
})
    .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().toLowerCase(),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string().min(1),
    password: zod_1.z
        .string()
        .min(8)
        .max(128)
        .regex(/[A-Z]/)
        .regex(/[a-z]/)
        .regex(/[0-9]/),
});
exports.verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
exports.enable2faSchema = zod_1.z.object({
    password: zod_1.z.string().min(1),
});
exports.verify2faSchema = zod_1.z.object({
    code: zod_1.z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
});
exports.disable2faSchema = zod_1.z.object({
    code: zod_1.z.string().regex(/^\d{6}$/),
});
//# sourceMappingURL=auth.dto.js.map