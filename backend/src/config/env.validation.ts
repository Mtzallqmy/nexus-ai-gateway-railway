import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3001),
  APP_NAME: z.string().default("Moataz AI Gateway"),
  APP_VERSION: z.string().default("2.0.0"),
  APP_URL: z.string().url(),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_KEY_PREFIX: z.string().default("moataz:"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 chars"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  JWT_ISSUER: z.string().default("moataz-ai-gateway"),
  JWT_AUDIENCE: z.string().default("moataz-ai-gateway-users"),

  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url().optional(),

  BCRYPT_ROUNDS: z.coerce.number().default(12),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  TWOFA_ISSUER: z.string().default("Moataz AI Gateway"),
  TWOFA_BACKUP_CODE_COUNT: z.coerce.number().default(10),

  RATE_LIMIT_TTL: z.coerce.number().default(60),
  RATE_LIMIT_LIMIT: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_TTL: z.coerce.number().default(60),
  RATE_LIMIT_AUTH_LIMIT: z.coerce.number().default(5),

  API_KEY_PREFIX: z.string().default("nx"),
  API_KEY_LENGTH: z.coerce.number().default(40),

  QUEUE_PREFIX: z.string().default("moataz"),
  QUEUE_CONCURRENCY: z.coerce.number().default(5),

  COOKIE_SECRET: z.string().min(16),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  COOKIE_SAMESITE: z.enum(["strict", "lax", "none"]).default("lax"),

  SWAGGER_PATH: z.string().default("api/docs"),
  SWAGGER_ENABLED: z
    .string()
    .optional()
    .transform((v) => v !== "false"),

  HEALTH_CHECK_INTERVAL_MS: z.coerce.number().default(30000),

  UPLOAD_DIR: z.string().default("./uploads"),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().default(10),

  SENTRY_DSN: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`\n❌ Environment validation failed:\n${errors}\n`);
  }
  return result.data;
}
