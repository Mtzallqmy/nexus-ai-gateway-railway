export declare const appConfig: (() => {
    env: "test" | "development" | "production";
    port: number;
    name: string;
    version: string;
    url: string;
    corsOrigins: string[];
    logLevel: "info" | "warn" | "error" | "debug";
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    database: {
        url: string;
        directUrl: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        keyPrefix: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
        issuer: string;
        audience: string;
    };
    betterAuth: {
        secret: string;
        url: string | undefined;
    };
    bcrypt: {
        rounds: number;
    };
    smtp: {
        host: string | undefined;
        port: number | undefined;
        user: string | undefined;
        password: string | undefined;
        from: string | undefined;
        secure: boolean;
    };
    twofa: {
        issuer: string;
        backupCodeCount: number;
    };
    rateLimit: {
        ttl: number;
        limit: number;
        authTtl: number;
        authLimit: number;
    };
    apiKey: {
        prefix: string;
        length: number;
    };
    queue: {
        prefix: string;
        concurrency: number;
    };
    cookie: {
        secret: string;
        secure: boolean;
        sameSite: "none" | "strict" | "lax";
    };
    swagger: {
        path: string;
        enabled: boolean;
    };
    health: {
        checkIntervalMs: number;
    };
    upload: {
        dir: string;
        maxSizeMb: number;
    };
    sentry: {
        dsn: string | undefined;
    };
    litellm: {
        baseUrl: string;
        masterKey: string;
        requestTimeoutMs: number;
        streamTimeoutMs: number;
        syncIntervalMinutes: number;
        healthCheckIntervalMs: number;
        cacheTtlSeconds: number;
        circuitBreakerFailureThreshold: number;
        circuitBreakerResetTimeoutMs: number;
        retryAttempts: number;
        retryBaseDelayMs: number;
        poolMaxConnections: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: "test" | "development" | "production";
    port: number;
    name: string;
    version: string;
    url: string;
    corsOrigins: string[];
    logLevel: "info" | "warn" | "error" | "debug";
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    database: {
        url: string;
        directUrl: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        keyPrefix: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
        issuer: string;
        audience: string;
    };
    betterAuth: {
        secret: string;
        url: string | undefined;
    };
    bcrypt: {
        rounds: number;
    };
    smtp: {
        host: string | undefined;
        port: number | undefined;
        user: string | undefined;
        password: string | undefined;
        from: string | undefined;
        secure: boolean;
    };
    twofa: {
        issuer: string;
        backupCodeCount: number;
    };
    rateLimit: {
        ttl: number;
        limit: number;
        authTtl: number;
        authLimit: number;
    };
    apiKey: {
        prefix: string;
        length: number;
    };
    queue: {
        prefix: string;
        concurrency: number;
    };
    cookie: {
        secret: string;
        secure: boolean;
        sameSite: "none" | "strict" | "lax";
    };
    swagger: {
        path: string;
        enabled: boolean;
    };
    health: {
        checkIntervalMs: number;
    };
    upload: {
        dir: string;
        maxSizeMb: number;
    };
    sentry: {
        dsn: string | undefined;
    };
    litellm: {
        baseUrl: string;
        masterKey: string;
        requestTimeoutMs: number;
        streamTimeoutMs: number;
        syncIntervalMinutes: number;
        healthCheckIntervalMs: number;
        cacheTtlSeconds: number;
        circuitBreakerFailureThreshold: number;
        circuitBreakerResetTimeoutMs: number;
        retryAttempts: number;
        retryBaseDelayMs: number;
        poolMaxConnections: number;
    };
}>;
export type AppConfig = ReturnType<typeof appConfig>;
