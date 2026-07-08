import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation";

export const appConfig = registerAs("app", () => {
  const env = validateEnv(process.env as unknown as Record<string, unknown>);
  return {
    env: env.NODE_ENV,
    port: env.PORT,
    name: env.APP_NAME,
    version: env.APP_VERSION,
    url: env.APP_URL,
    corsOrigins: env.CORS_ORIGINS.split(",").map((s) => s.trim()),
    logLevel: env.LOG_LEVEL,
    isProduction: env.NODE_ENV === "production",
    isDevelopment: env.NODE_ENV === "development",
    isTest: env.NODE_ENV === "test",

    database: {
      url: env.DATABASE_URL,
      directUrl: env.DIRECT_URL,
    },

    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      db: env.REDIS_DB,
      keyPrefix: env.REDIS_KEY_PREFIX,
    },

    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },

    betterAuth: {
      secret: env.BETTER_AUTH_SECRET,
      url: env.BETTER_AUTH_URL,
    },

    bcrypt: {
      rounds: env.BCRYPT_ROUNDS,
    },

    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
      from: env.SMTP_FROM,
      secure: env.SMTP_SECURE,
    },

    twofa: {
      issuer: env.TWOFA_ISSUER,
      backupCodeCount: env.TWOFA_BACKUP_CODE_COUNT,
    },

    rateLimit: {
      ttl: env.RATE_LIMIT_TTL,
      limit: env.RATE_LIMIT_LIMIT,
      authTtl: env.RATE_LIMIT_AUTH_TTL,
      authLimit: env.RATE_LIMIT_AUTH_LIMIT,
    },

    apiKey: {
      prefix: env.API_KEY_PREFIX,
      length: env.API_KEY_LENGTH,
    },

    queue: {
      prefix: env.QUEUE_PREFIX,
      concurrency: env.QUEUE_CONCURRENCY,
    },

    cookie: {
      secret: env.COOKIE_SECRET,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAMESITE,
    },

    swagger: {
      path: env.SWAGGER_PATH,
      enabled: env.SWAGGER_ENABLED,
    },

    health: {
      checkIntervalMs: env.HEALTH_CHECK_INTERVAL_MS,
    },

    upload: {
      dir: env.UPLOAD_DIR,
      maxSizeMb: env.UPLOAD_MAX_SIZE_MB,
    },

    sentry: {
      dsn: env.SENTRY_DSN,
    },

    // ===== LiteLLM Integration (Phase 3) =====
    litellm: {
      baseUrl: process.env.LITELLM_BASE_URL ?? "http://localhost:4000",
      masterKey: process.env.LITELLM_MASTER_KEY ?? "",
      requestTimeoutMs: Number(process.env.LITELLM_REQUEST_TIMEOUT_MS ?? 30000),
      streamTimeoutMs: Number(process.env.LITELLM_STREAM_TIMEOUT_MS ?? 60000),
      syncIntervalMinutes: Number(process.env.LITELLM_SYNC_INTERVAL_MINUTES ?? 5),
      healthCheckIntervalMs: Number(process.env.LITELLM_HEALTH_CHECK_INTERVAL_MS ?? 30000),
      cacheTtlSeconds: Number(process.env.LITELLM_CACHE_TTL_SECONDS ?? 300),
      circuitBreakerFailureThreshold: Number(process.env.LITELLM_CIRCUIT_BREAKER_FAILURE_THRESHOLD ?? 5),
      circuitBreakerResetTimeoutMs: Number(process.env.LITELLM_CIRCUIT_BREAKER_RESET_TIMEOUT_MS ?? 60000),
      retryAttempts: Number(process.env.LITELLM_RETRY_ATTEMPTS ?? 3),
      retryBaseDelayMs: Number(process.env.LITELLM_RETRY_BASE_DELAY_MS ?? 500),
      poolMaxConnections: Number(process.env.LITELLM_POOL_MAX_CONNECTIONS ?? 50),
    },
  };
});

export type AppConfig = ReturnType<typeof appConfig>;
