import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { buildWinstonOptions } from "./infrastructure/logging/winston.config";

async function bootstrap() {
  const logger = WinstonModule.createLogger(buildWinstonOptions(process.env.LOG_LEVEL ?? "info"));

  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>("app.port") ?? 3001;
  const appName = config.get<string>("app.name") ?? "Moataz AI Gateway";
  const corsOrigins = config.get<string[]>("app.corsOrigins") ?? ["http://localhost:3000"];
  const swaggerPath = config.get<string>("app.swagger.path") ?? "api/docs";
  const swaggerEnabled = config.get<boolean>("app.swagger.enabled") ?? true;

  // Security middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cookieParser(config.get<string>("app.cookie.secret")));

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
  });

  // Global validation pipe (fallback for non-Zod DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      validateCustomDecorators: true,
    })
  );

  // Trust proxy (for rate limiting / IP detection behind reverse proxy)
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance() as { set?: (k: string, v: unknown) => void };
  instance?.set?.("trust proxy", 1);

  // Swagger / OpenAPI
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(
        "Moataz AI Gateway backend API. Authentication via JWT bearer token (obtain from /auth/login) or API key (x-api-key header)."
      )
      .setVersion("2.0.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT", name: "Authorization" },
        "access-token"
      )
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
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: { persistAuthorization: true },
      customSiteTitle: `${appName} — API Docs`,
    });
    // Also serve raw OpenAPI JSON
    app.use(`/${swaggerPath}-json`, (_req: unknown, res: { json: (d: unknown) => void }) =>
      res.json(document)
    );
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, "0.0.0.0");

  const log = new Logger("Bootstrap");
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
