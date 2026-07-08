"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3001),
    APP_NAME: zod_1.z.string().default("Moataz AI Gateway"),
    APP_VERSION: zod_1.z.string().default("2.0.0"),
    APP_URL: zod_1.z.string().url(),
    CORS_ORIGINS: zod_1.z.string().default("http://localhost:3000"),
    LOG_LEVEL: zod_1.z.enum(["debug", "info", "warn", "error"]).default("info"),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: zod_1.z.string().optional(),
    REDIS_HOST: zod_1.z.string().default("localhost"),
    REDIS_PORT: zod_1.z.coerce.number().default(6379),
    REDIS_PASSWORD: zod_1.z.string().optional(),
    REDIS_DB: zod_1.z.coerce.number().default(0),
    REDIS_KEY_PREFIX: zod_1.z.string().default("moataz:"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("30d"),
    JWT_ISSUER: zod_1.z.string().default("moataz-ai-gateway"),
    JWT_AUDIENCE: zod_1.z.string().default("moataz-ai-gateway-users"),
    BETTER_AUTH_SECRET: zod_1.z.string().min(16),
    BETTER_AUTH_URL: zod_1.z.string().url().optional(),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().default(12),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASSWORD: zod_1.z.string().optional(),
    SMTP_FROM: zod_1.z.string().optional(),
    SMTP_SECURE: zod_1.z
        .string()
        .optional()
        .transform((v) => v === "true"),
    TWOFA_ISSUER: zod_1.z.string().default("Moataz AI Gateway"),
    TWOFA_BACKUP_CODE_COUNT: zod_1.z.coerce.number().default(10),
    RATE_LIMIT_TTL: zod_1.z.coerce.number().default(60),
    RATE_LIMIT_LIMIT: zod_1.z.coerce.number().default(100),
    RATE_LIMIT_AUTH_TTL: zod_1.z.coerce.number().default(60),
    RATE_LIMIT_AUTH_LIMIT: zod_1.z.coerce.number().default(5),
    API_KEY_PREFIX: zod_1.z.string().default("nx"),
    API_KEY_LENGTH: zod_1.z.coerce.number().default(40),
    QUEUE_PREFIX: zod_1.z.string().default("moataz"),
    QUEUE_CONCURRENCY: zod_1.z.coerce.number().default(5),
    COOKIE_SECRET: zod_1.z.string().min(16),
    COOKIE_SECURE: zod_1.z
        .string()
        .optional()
        .transform((v) => v === "true"),
    COOKIE_SAMESITE: zod_1.z.enum(["strict", "lax", "none"]).default("lax"),
    SWAGGER_PATH: zod_1.z.string().default("api/docs"),
    SWAGGER_ENABLED: zod_1.z
        .string()
        .optional()
        .transform((v) => v !== "false"),
    HEALTH_CHECK_INTERVAL_MS: zod_1.z.coerce.number().default(30000),
    UPLOAD_DIR: zod_1.z.string().default("./uploads"),
    UPLOAD_MAX_SIZE_MB: zod_1.z.coerce.number().default(10),
    SENTRY_DSN: zod_1.z.string().optional(),
});
function validateEnv(config) {
    const result = exports.envSchema.safeParse(config);
    if (!result.success) {
        const errors = result.error.issues
            .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
            .join("\n");
        throw new Error(`\n❌ Environment validation failed:\n${errors}\n`);
    }
    return result.data;
}
//# sourceMappingURL=env.validation.js.map