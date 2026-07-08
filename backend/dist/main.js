"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const nest_winston_1 = require("nest-winston");
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const winston_config_1 = require("./infrastructure/logging/winston.config");
async function bootstrap() {
    const logger = nest_winston_1.WinstonModule.createLogger((0, winston_config_1.buildWinstonOptions)(process.env.LOG_LEVEL ?? "info"));
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger,
        bufferLogs: true,
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get("app.port") ?? 3001;
    const appName = config.get("app.name") ?? "Moataz AI Gateway";
    const corsOrigins = config.get("app.corsOrigins") ?? ["http://localhost:3000"];
    const swaggerPath = config.get("app.swagger.path") ?? "api/docs";
    const swaggerEnabled = config.get("app.swagger.enabled") ?? true;
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    app.use((0, cookie_parser_1.default)(config.get("app.cookie.secret")));
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key", "X-Request-Id"],
        exposedHeaders: ["X-Request-Id", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        validateCustomDecorators: true,
    }));
    const httpAdapter = app.getHttpAdapter();
    const instance = httpAdapter.getInstance();
    instance?.set?.("trust proxy", 1);
    if (swaggerEnabled) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle(appName)
            .setDescription("Moataz AI Gateway backend API. Authentication via JWT bearer token (obtain from /auth/login) or API key (x-api-key header).")
            .setVersion("2.0.0")
            .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization" }, "access-token")
            .addApiKey({ type: "apiKey", name: "X-Api-Key", in: "header" }, "api-key")
            .addTag("Auth", "Authentication & authorization endpoints")
            .addTag("Users", "User management")
            .addTag("Organizations", "Organization management")
            .addTag("Teams", "Team management")
            .addTag("Projects", "Project management")
            .addTag("Roles", "Role management (RBAC)")
            .addTag("Permissions", "Permission management (RBAC)")
            .addTag("API Keys", "API key management")
            .addTag("Audit Logs", "Audit trail")
            .addTag("Sessions", "Session management")
            .addTag("Notifications", "In-app and email notifications")
            .addTag("Settings", "Application settings")
            .addTag("Health", "Health & readiness checks")
            .addTag("Metrics", "System metrics")
            .addTag("LiteLLM", "LiteLLM AI Gateway integration")
            .addTag("Providers", "Provider registry, validation, discovery, health, analytics")
            .addTag("AI API", "Unified AI API (OpenAI-compatible) — chat, embeddings, images, audio")
            .addTag("Playground", "Playground conversations, saved prompts, collections, code samples")
            .addTag("Analytics", "Usage, request, provider, model, cost, latency, error analytics")
            .addTag("Usage", "Usage tracking — requests, tokens, streaming, images, etc.")
            .addTag("Cost Tracking", "Cost by provider, user, org, model — daily, monthly, estimated vs real")
            .addTag("Billing", "Plans, subscriptions, quotas, credits, invoices, payments, coupons")
            .addTag("Monitoring", "System health — CPU, RAM, disk, network, services, integrations")
            .addTag("Alerts", "Alert rules, evaluation, management")
            .addTag("Reporting", "Daily, weekly, monthly reports with CSV/Excel/PDF export")
            .addTag("Admin", "System, provider, billing, monitoring, notification settings")
            .addTag("Jobs", "Background jobs — cleanup, statistics, aggregation, sync, health checks")
            .addTag("Security", "Encrypted storage, secret management, audit trail, access control")
            .addTag("System", "Root system endpoints")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(swaggerPath, app, document, {
            swaggerOptions: { persistAuthorization: true },
            customSiteTitle: `${appName} — API Docs`,
        });
        app.use(`/${swaggerPath}-json`, (_req, res) => res.json(document));
    }
    app.enableShutdownHooks();
    await app.listen(port, "0.0.0.0");
    const log = new common_1.Logger("Bootstrap");
    log.log(`🚀 ${appName} running on http://localhost:${port}`);
    if (swaggerEnabled) {
        log.log(`📚 Swagger UI:  http://localhost:${port}/${swaggerPath}`);
        log.log(`📄 OpenAPI JSON: http://localhost:${port}/${swaggerPath}-json`);
    }
    log.log(`❤️  Health:      http://localhost:${port}/health`);
}
bootstrap().catch((err) => {
    console.error("Fatal error during bootstrap", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map