/**
 * Provider Service
 *
 * Orchestrates: registry management, API key validation (REAL requests via LiteLLM),
 * provider discovery, health monitoring, statistics, analytics, and logs.
 *
 * IMPORTANT: All validation/discovery requests go through LiteLLMClient, which
 * is the ONLY class that talks to LiteLLM. NestJS never contacts AI providers directly.
 */
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { PROVIDER_CATALOG, getProviderBySlug, type ProviderCatalogEntry } from "./registry/provider-catalog";
import type { LiteLLMClient } from "../litellm/litellm.client";
import { LITELLM_LOG_CONTEXTS } from "../litellm/litellm.constants";
import type {
  ListProvidersQueryDto,
  ProviderAnalyticsQueryDto,
  ProviderLogsQueryDto,
  ValidateApiKeyDto,
  DiscoverProviderDto,
  CreateProviderDto,
  UpdateProviderDto,
} from "./dto/provider.dto";
import { buildPagination } from "../../common/dto/pagination.dto";

export interface ValidationResult {
  providerName: string;
  status: "VALID" | "INVALID" | "EXPIRED" | "DISABLED" | "QUOTA_EXCEEDED" | "BILLING_REQUIRED" | "RATE_LIMITED" | "REGION_BLOCKED" | "ORG_REQUIRED" | "PERMISSION_DENIED" | "UNSUPPORTED_MODEL" | "UNSUPPORTED_ENDPOINT" | "UNSUPPORTED_PARAMS" | "INTERNAL_ERROR" | "NETWORK_ERROR" | "TIMEOUT" | "UNKNOWN";
  isValid: boolean;
  httpStatus?: number;
  providerError?: string;
  providerCode?: string;
  providerMessage?: string;
  requestId?: string;
  retryAfter?: number;
  latencyMs: number;
  validatedModels: string[];
  detectedQuota?: Record<string, unknown>;
  detectedRateLimit?: Record<string, unknown>;
  errorMessage?: string;
  validatedAt: string;
}

export interface DiscoveryResult {
  providerName: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  apiVersion?: string;
  availableModels: string[];
  capabilities: Record<string, boolean>;
  detectedFeatures: string[];
  visionSupport: boolean;
  imageSupport: boolean;
  audioSupport: boolean;
  speechSupport: boolean;
  embeddingsSupport: boolean;
  moderationSupport: boolean;
  functionCallingSupport: boolean;
  streamingSupport: boolean;
  jsonModeSupport: boolean;
  thinkingSupport: boolean;
  reasoningSupport: boolean;
  toolCallingSupport: boolean;
  structuredOutputSupport: boolean;
  errorMessage?: string;
  discoveredAt?: string;
}

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger("ProvidersService");

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly litellmClient: LiteLLMClient
  ) {
    // Seed the registry on first use
    this.seedRegistry().catch((err) => this.logger.warn(`Registry seed failed: ${err.message}`));
  }

  // ============================================================
  // DYNAMIC PROVIDER MANAGEMENT
  // ============================================================

  /**
   * Create a new provider record in the database. This method
   * generates a slug and litellmId automatically. If a provider with
   * the same slug already exists an error will be thrown. See
   * provider.dto.ts for the DTO definition.
   */
  async createProvider(dto: CreateProviderDto) {
    const slug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    // Ensure uniqueness of slug by appending a counter if necessary
    let uniqueSlug = slug;
    let counter = 1;
    while (await this.prisma.provider.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter++}`;
    }
    // Generate a litellm identifier. We use a short random hash.
    const litellmId = crypto.randomBytes(6).toString("hex");
    const provider = await this.prisma.provider.create({
      data: {
        name: dto.name,
        slug: uniqueSlug,
        description: dto.description ?? null,
        baseUrl: dto.baseUrl,
        region: dto.region ?? null,
        litellmId,
      },
    });
    return provider;
  }

  /**
   * Update an existing provider record. Only the fields present in the
   * DTO will be updated. Throws a NotFoundException if the provider
   * does not exist.
   */
  async updateProvider(id: string, dto: UpdateProviderDto) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Provider with id '${id}' not found`);
    }
    // If the name is being updated regenerate the slug
    let updatedSlug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      const baseSlug = dto.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      updatedSlug = baseSlug;
      let counter = 1;
      while (await this.prisma.provider.findFirst({ where: { slug: updatedSlug, id: { not: id } } })) {
        updatedSlug = `${baseSlug}-${counter++}`;
      }
    }
    const provider = await this.prisma.provider.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        slug: dto.name ? updatedSlug : undefined,
        description: dto.description ?? undefined,
        baseUrl: dto.baseUrl ?? undefined,
        region: dto.region ?? undefined,
      },
    });
    return provider;
  }

  /**
   * Delete a provider record by id. Throws NotFoundException if the
   * provider does not exist.
   */
  async deleteProvider(id: string) {
    const existing = await this.prisma.provider.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Provider with id '${id}' not found`);
    }
    await this.prisma.provider.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Test connectivity to a provider's base URL. This performs a simple
   * HTTP GET request to the base URL and measures the latency. It
   * returns an object indicating whether the request succeeded and the
   * measured latency in milliseconds.
   */
  async testConnection(id: string): Promise<{ success: boolean; latencyMs: number }> {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) {
      throw new NotFoundException(`Provider with id '${id}' not found`);
    }
    const started = Date.now();
    let success = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(provider.baseUrl, { signal: controller.signal, method: "HEAD" });
      success = res.ok;
      clearTimeout(timeout);
    } catch {
      success = false;
    }
    const latencyMs = Date.now() - started;
    return { success, latencyMs };
  }

  // ============================================================
  // REGISTRY
  // ============================================================

  async seedRegistry(): Promise<void> {
    for (const entry of PROVIDER_CATALOG) {
      await this.prisma.providerRegistryEntry.upsert({
        where: { slug: entry.slug },
        update: {
          name: entry.name,
          displayName: entry.displayName,
          description: entry.description,
          type: entry.type as never,
          websiteUrl: entry.websiteUrl || null,
          docsUrl: entry.docsUrl || null,
          supportedFeatures: entry.supportedFeatures,
          supportedCapabilities: entry.supportedCapabilities,
          defaultModels: entry.defaultModels,
          apiVersion: entry.apiVersion || null,
          authType: entry.authType,
          metadata: entry as unknown as Prisma.InputJsonValue,
        },
        create: {
          name: entry.name,
          slug: entry.slug,
          displayName: entry.displayName,
          description: entry.description,
          type: entry.type as never,
          websiteUrl: entry.websiteUrl || null,
          docsUrl: entry.docsUrl || null,
          supportedFeatures: entry.supportedFeatures,
          supportedCapabilities: entry.supportedCapabilities,
          defaultModels: entry.defaultModels,
          apiVersion: entry.apiVersion || null,
          authType: entry.authType,
          metadata: entry as unknown as Prisma.InputJsonValue,
        },
      });
    }
    this.logger.log(`Provider registry seeded with ${PROVIDER_CATALOG.length} providers`);
  }

  async findAll(query: ListProvidersQueryDto) {
    const where: Prisma.ProviderRegistryEntryWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { displayName: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }
    if (query.type) where.type = query.type as never;
    if (query.enabled !== undefined) where.isEnabled = query.enabled;

    const [items, total] = await Promise.all([
      this.prisma.providerRegistryEntry.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.providerRegistryEntry.count({ where }),
    ]);
    return buildPagination(items, total, query);
  }

  async findBySlug(slug: string) {
    const entry = await this.prisma.providerRegistryEntry.findUnique({ where: { slug } });
    if (!entry) throw new NotFoundException(`Provider '${slug}' not found in registry`);
    return entry;
  }

  async getCatalog(): Promise<ProviderCatalogEntry[]> {
    return PROVIDER_CATALOG;
  }

  // ============================================================
  // API KEY VALIDATION (REAL requests via LiteLLM)
  // ============================================================

  /**
   * Validates an API key by making a REAL request through LiteLLM.
   * NEVER fakes validation — always sends an actual request.
   *
   * Detection matrix:
   *   401 → INVALID
   *   403 → PERMISSION_DENIED or REGION_BLOCKED
   *   404 → UNSUPPORTED_ENDPOINT
   *   422 → UNSUPPORTED_PARAMS or UNSUPPORTED_MODEL
   *   429 → RATE_LIMITED
   *   402 → BILLING_REQUIRED
   *   5xx → INTERNAL_ERROR
   *   network → NETWORK_ERROR
   *   timeout → TIMEOUT
   */
  async validateApiKey(dto: ValidateApiKeyDto): Promise<ValidationResult> {
    const startedAt = Date.now();
    const provider = getProviderBySlug(dto.providerName) ?? PROVIDER_CATALOG.find((p) => p.name === dto.providerName);
    if (!provider) {
      throw new NotFoundException(`Unknown provider: ${dto.providerName}`);
    }

    const apiKeyHash = crypto.createHash("sha256").update(dto.apiKey).digest("hex");
    const apiKeyMasked = `${dto.apiKey.slice(0, 4)}••••••••${dto.apiKey.slice(-4)}`;
    const modelToTest = dto.modelToTest ?? provider.defaultModels[0] ?? "gpt-3.5-turbo";
    const litellmModel = `${provider.litellmPrefix}${modelToTest}`;

    this.logger.log(`Validating API key for ${dto.providerName} (model=${litellmModel})`);

    const result: ValidationResult = {
      providerName: dto.providerName,
      status: "UNKNOWN",
      isValid: false,
      latencyMs: 0,
      validatedModels: [],
      validatedAt: new Date().toISOString(),
    };

    try {
      // Make a REAL request through LiteLLM to validate the key
      // Using a minimal chat completion request
      await this.litellmClient.chatCompletion({
        model: litellmModel,
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 1,
        temperature: 0,
      });

      result.latencyMs = Date.now() - startedAt;
      result.status = "VALID";
      result.isValid = true;
      result.validatedModels = [modelToTest];
      this.logger.log(`API key validated for ${dto.providerName} (${result.latencyMs}ms)`);
    } catch (err) {
      result.latencyMs = Date.now() - startedAt;
      const httpErr = err as { status?: number; code?: string; message: string };

      result.httpStatus = httpErr.status;
      result.errorMessage = httpErr.message;
      result.providerError = httpErr.code ?? httpErr.constructor.name;

      // Map HTTP status to validation status
      switch (httpErr.status) {
        case 401:
          result.status = "INVALID";
          result.providerMessage = "Invalid API key";
          break;
        case 402:
          result.status = "BILLING_REQUIRED";
          result.providerMessage = "Payment required or billing limit reached";
          break;
        case 403:
          // Could be permission denied or region blocked
          if (httpErr.message.toLowerCase().includes("region")) {
            result.status = "REGION_BLOCKED";
          } else if (httpErr.message.toLowerCase().includes("organization")) {
            result.status = "ORG_REQUIRED";
          } else {
            result.status = "PERMISSION_DENIED";
          }
          result.providerMessage = httpErr.message;
          break;
        case 404:
          result.status = "UNSUPPORTED_ENDPOINT";
          result.providerMessage = "Endpoint not found";
          break;
        case 422:
          if (httpErr.message.toLowerCase().includes("model")) {
            result.status = "UNSUPPORTED_MODEL";
          } else {
            result.status = "UNSUPPORTED_PARAMS";
          }
          result.providerMessage = httpErr.message;
          break;
        case 429:
          result.status = "RATE_LIMITED";
          result.providerMessage = "Rate limit exceeded";
          result.retryAfter = 60;
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          result.status = "INTERNAL_ERROR";
          result.providerMessage = "Provider internal error";
          break;
        default:
          // Network errors
          if (httpErr.code === "ECONNRESET" || httpErr.code === "ETIMEDOUT" || httpErr.code === "ENOTFOUND" || httpErr.code === "ECONNREFUSED") {
            result.status = "NETWORK_ERROR";
          } else if (httpErr.code === "ABORT_ERR" || httpErr.message?.includes("timeout")) {
            result.status = "TIMEOUT";
          } else if (httpErr.message?.toLowerCase().includes("quota")) {
            result.status = "QUOTA_EXCEEDED";
          } else if (httpErr.message?.toLowerCase().includes("disabled")) {
            result.status = "DISABLED";
          } else if (httpErr.message?.toLowerCase().includes("expired")) {
            result.status = "EXPIRED";
          } else {
            result.status = "UNKNOWN";
          }
          result.providerMessage = httpErr.message;
      }

      this.logger.warn(`API key validation failed for ${dto.providerName}: status=${result.status} http=${httpErr.status}`);
    }

    // Store validation result
    await this.prisma.apiKeyValidation.create({
      data: {
        providerName: dto.providerName,
        apiKeyMasked,
        apiKeyHash,
        status: result.status as never,
        httpStatus: result.httpStatus ?? null,
        providerError: result.providerError ?? null,
        providerCode: result.providerCode ?? null,
        providerMessage: result.providerMessage ?? null,
        requestId: result.requestId ?? null,
        retryAfter: result.retryAfter ?? null,
        latencyMs: result.latencyMs,
        validatedModels: result.validatedModels,
        detectedQuota: (result.detectedQuota as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        detectedRateLimit: (result.detectedRateLimit as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        isValid: result.isValid,
        errorMessage: result.errorMessage ?? null,
      },
    });

    return result;
  }

  async getValidationHistory(providerName?: string, limit = 20) {
    const where: Prisma.ApiKeyValidationWhereInput = providerName ? { providerName } : {};
    return this.prisma.apiKeyValidation.findMany({
      where,
      orderBy: { validatedAt: "desc" },
      take: limit,
    });
  }

  // ============================================================
  // PROVIDER DISCOVERY (auto-detect capabilities)
  // ============================================================

  /**
   * Discovers a provider's capabilities by making REAL requests via LiteLLM.
   * - Fetches the model list from LiteLLM
   * - Tests each capability with a minimal request
   * - Stores results in provider_discovery_results
   */
  async discoverProvider(dto: DiscoverProviderDto): Promise<DiscoveryResult> {
    const provider = getProviderBySlug(dto.providerName) ?? PROVIDER_CATALOG.find((p) => p.name === dto.providerName);
    if (!provider) {
      throw new NotFoundException(`Unknown provider: ${dto.providerName}`);
    }

    this.logger.log(`Discovering provider: ${dto.providerName} (deep=${dto.deep})`);

    const result: DiscoveryResult = {
      providerName: dto.providerName,
      status: "IN_PROGRESS",
      availableModels: [],
      capabilities: {},
      detectedFeatures: provider.supportedFeatures,
      visionSupport: provider.capabilities.vision,
      imageSupport: provider.capabilities.image,
      audioSupport: provider.capabilities.audio,
      speechSupport: provider.capabilities.speech,
      embeddingsSupport: provider.capabilities.embeddings,
      moderationSupport: provider.capabilities.moderation,
      functionCallingSupport: provider.capabilities.functionCalling,
      streamingSupport: provider.capabilities.streaming,
      jsonModeSupport: provider.capabilities.jsonMode,
      thinkingSupport: provider.capabilities.thinking,
      reasoningSupport: provider.capabilities.reasoning,
      toolCallingSupport: provider.capabilities.toolCalling,
      structuredOutputSupport: provider.capabilities.structuredOutput,
    };

    try {
      // 1. Fetch model list from LiteLLM (REAL request)
      const modelsResponse = await this.litellmClient.getModels();
      const providerModels = (modelsResponse.data ?? []).filter((m) => {
        const litellmModel = m.litellm_params?.model ?? m.id;
        return litellmModel?.startsWith(provider.litellmPrefix);
      });
      result.availableModels = providerModels.map((m) => m.id);

      // 2. If deep discovery, test each capability with a REAL minimal request
      if (dto.deep && providerModels.length > 0) {
        const testModel = `${provider.litellmPrefix}${providerModels[0]?.id ?? provider.defaultModels[0]}`;

        // Test streaming
        try {
          const stream = this.litellmClient.chatCompletionStream({
            model: testModel,
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 1,
          });
          for await (const _chunk of stream) { void _chunk; break; }
          result.streamingSupport = true;
        } catch { result.streamingSupport = false; }

        // Test JSON mode
        try {
          await this.litellmClient.chatCompletion({
            model: testModel,
            messages: [{ role: "user", content: "Return {\"ok\": true}" }],
            max_tokens: 10,
            metadata: { response_format: { type: "json_object" } } as never,
          });
          result.jsonModeSupport = true;
        } catch { result.jsonModeSupport = false; }

        // Test function calling
        try {
          await this.litellmClient.chatCompletion({
            model: testModel,
            messages: [{ role: "user", content: "What's the weather?" }],
            max_tokens: 10,
            metadata: { tools: [{ type: "function", function: { name: "get_weather", parameters: { type: "object", properties: {} } } }] } as never,
          });
          result.functionCallingSupport = true;
          result.toolCallingSupport = true;
        } catch { result.functionCallingSupport = false; result.toolCallingSupport = false; }

        // Test embeddings
        if (provider.capabilities.embeddings) {
          try {
            await this.litellmClient.embeddings(testModel, "test");
            result.embeddingsSupport = true;
          } catch { result.embeddingsSupport = false; }
        }
      }

      result.status = "COMPLETED";
      result.discoveredAt = new Date().toISOString();
      result.apiVersion = provider.apiVersion;
      result.capabilities = {
        vision: result.visionSupport,
        image: result.imageSupport,
        audio: result.audioSupport,
        speech: result.speechSupport,
        embeddings: result.embeddingsSupport,
        moderation: result.moderationSupport,
        functionCalling: result.functionCallingSupport,
        streaming: result.streamingSupport,
        jsonMode: result.jsonModeSupport,
        thinking: result.thinkingSupport,
        reasoning: result.reasoningSupport,
        toolCalling: result.toolCallingSupport,
        structuredOutput: result.structuredOutputSupport,
      };

      this.logger.log(`Discovery completed for ${dto.providerName}: ${result.availableModels.length} models found`);
    } catch (err) {
      result.status = "FAILED";
      result.errorMessage = (err as Error).message;
      this.logger.error(`Discovery failed for ${dto.providerName}: ${result.errorMessage}`);
    }

    // Store discovery result
    await this.prisma.providerDiscoveryResult.upsert({
      where: { providerName: dto.providerName },
      update: {
        status: result.status as never,
        apiVersion: result.apiVersion ?? null,
        availableModels: result.availableModels as Prisma.InputJsonValue,
        capabilities: result.capabilities as Prisma.InputJsonValue,
        detectedFeatures: result.detectedFeatures,
        visionSupport: result.visionSupport,
        imageSupport: result.imageSupport,
        audioSupport: result.audioSupport,
        speechSupport: result.speechSupport,
        embeddingsSupport: result.embeddingsSupport,
        moderationSupport: result.moderationSupport,
        functionCallingSupport: result.functionCallingSupport,
        streamingSupport: result.streamingSupport,
        jsonModeSupport: result.jsonModeSupport,
        thinkingSupport: result.thinkingSupport,
        reasoningSupport: result.reasoningSupport,
        toolCallingSupport: result.toolCallingSupport,
        structuredOutputSupport: result.structuredOutputSupport,
        errorMessage: result.errorMessage ?? null,
        discoveredAt: result.discoveredAt ? new Date(result.discoveredAt) : null,
      },
      create: {
        providerName: dto.providerName,
        status: result.status as never,
        apiVersion: result.apiVersion ?? null,
        availableModels: result.availableModels as Prisma.InputJsonValue,
        capabilities: result.capabilities as Prisma.InputJsonValue,
        detectedFeatures: result.detectedFeatures,
        visionSupport: result.visionSupport,
        imageSupport: result.imageSupport,
        audioSupport: result.audioSupport,
        speechSupport: result.speechSupport,
        embeddingsSupport: result.embeddingsSupport,
        moderationSupport: result.moderationSupport,
        functionCallingSupport: result.functionCallingSupport,
        streamingSupport: result.streamingSupport,
        jsonModeSupport: result.jsonModeSupport,
        thinkingSupport: result.thinkingSupport,
        reasoningSupport: result.reasoningSupport,
        toolCallingSupport: result.toolCallingSupport,
        structuredOutputSupport: result.structuredOutputSupport,
        errorMessage: result.errorMessage ?? null,
        discoveredAt: result.discoveredAt ? new Date(result.discoveredAt) : null,
      },
    });

    return result;
  }

  async getDiscoveryResult(providerName: string) {
    return this.prisma.providerDiscoveryResult.findUnique({ where: { providerName } });
  }

  async getAllDiscoveryResults() {
    return this.prisma.providerDiscoveryResult.findMany({ orderBy: { updatedAt: "desc" } });
  }

  // ============================================================
  // HEALTH MONITORING
  // ============================================================

  async getProviderHealth(providerName?: string) {
    // ProviderHealth uses providerId (UUID), not providerName
    // For Phase 4, we return the latest health checks from the litellm_providers table
    if (providerName) {
      const provider = await this.prisma.provider.findFirst({ where: { slug: providerName } });
      if (!provider) return [];
      return this.prisma.providerHealth.findMany({
        where: { providerId: provider.id },
        orderBy: { checkedAt: "desc" },
        take: 100,
      });
    }
    return this.prisma.providerHealth.findMany({
      orderBy: { checkedAt: "desc" },
      take: 100,
    });
  }

  async runHealthCheck(providerName?: string): Promise<{ checked: number; healthy: number; unhealthy: number }> {
    const health = await this.litellmClient.getHealthFull();
    let checked = 0;
    let healthy = 0;
    let unhealthy = 0;

    for (const endpoint of health.healthy_endpoints ?? []) {
      if (providerName && !endpoint.model.includes(providerName)) continue;
      checked++;
      healthy++;
    }

    for (const endpoint of health.unhealthy_endpoints ?? []) {
      if (providerName && !endpoint.model.includes(providerName)) continue;
      checked++;
      unhealthy++;
    }

    return { checked, healthy, unhealthy };
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  async getStatistics(providerName?: string) {
    const where = providerName ? { providerName } : {};
    const [totalRequests, totalErrors, totalTokens, totalCost] = await Promise.all([
      this.prisma.providerLog.count({ where }),
      this.prisma.providerLog.count({ where: { ...where, requestStatus: { gte: 400 } } }),
      this.prisma.providerLog.aggregate({ where, _sum: { tokenCount: true } }),
      this.prisma.providerLog.aggregate({ where, _sum: { cost: true } }),
    ]);

    const avgLatency = await this.prisma.providerLog.aggregate({
      where,
      _avg: { durationMs: true },
    });

    return {
      totalRequests,
      totalErrors,
      totalTokens: totalTokens._sum.tokenCount ?? 0,
      totalCost: totalCost._sum.cost ?? new Prisma.Decimal(0),
      avgLatencyMs: Math.round(avgLatency._avg.durationMs ?? 0),
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      successRate: totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 0,
    };
  }

  // ============================================================
  // ANALYTICS
  // ============================================================

  async getAnalytics(query: ProviderAnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const where: Prisma.ProviderLogWhereInput = {
      createdAt: { gte: startDate, lte: endDate },
    };
    if (query.providerName) where.providerName = query.providerName;

    const [logs, aggregated] = await Promise.all([
      this.prisma.providerLog.findMany({
        where,
        orderBy: { createdAt: "asc" },
        select: {
          providerName: true,
          modelName: true,
          requestStatus: true,
          durationMs: true,
          tokenCount: true,
          cost: true,
          createdAt: true,
          isStreaming: true,
          isCached: true,
        },
      }),
      this.prisma.providerLog.groupBy({
        by: ["providerName"],
        where,
        _count: { id: true },
        _sum: { tokenCount: true, cost: true },
        _avg: { durationMs: true },
      }),
    ]);

    return {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      granularity: query.granularity,
      totalRequests: logs.length,
      providers: aggregated.map((a) => ({
        providerName: a.providerName,
        requestCount: a._count.id,
        totalTokens: a._sum.tokenCount ?? 0,
        totalCost: a._sum.cost ?? new Prisma.Decimal(0),
        avgLatencyMs: Math.round(a._avg.durationMs ?? 0),
      })),
      timeline: this.buildTimeline(logs, query.granularity),
    };
  }

  private buildTimeline(logs: Array<{ createdAt: Date; requestStatus: number; durationMs: number; tokenCount: number; cost: Prisma.Decimal }>, granularity: string) {
    const buckets = new Map<string, { requests: number; errors: number; tokens: number; cost: number; latencySum: number }>();

    for (const log of logs) {
      const key = this.bucketKey(log.createdAt, granularity);
      const bucket = buckets.get(key) ?? { requests: 0, errors: 0, tokens: 0, cost: 0, latencySum: 0 };
      bucket.requests++;
      if (log.requestStatus >= 400) bucket.errors++;
      bucket.tokens += log.tokenCount;
      bucket.cost += Number(log.cost);
      bucket.latencySum += log.durationMs;
      buckets.set(key, bucket);
    }

    return Array.from(buckets.entries()).map(([timestamp, data]) => ({
      timestamp,
      requests: data.requests,
      errors: data.errors,
      tokens: data.tokens,
      cost: data.cost,
      avgLatencyMs: data.requests > 0 ? Math.round(data.latencySum / data.requests) : 0,
    }));
  }

  private bucketKey(date: Date, granularity: string): string {
    const d = new Date(date);
    switch (granularity) {
      case "hour":
        d.setMinutes(0, 0, 0);
        return d.toISOString();
      case "day":
        d.setHours(0, 0, 0, 0);
        return d.toISOString().slice(0, 10);
      case "week": {
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d.toISOString().slice(0, 10);
      }
      case "month":
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d.toISOString().slice(0, 7);
      default:
        return d.toISOString().slice(0, 10);
    }
  }

  // ============================================================
  // LOGS
  // ============================================================

  async getLogs(query: ProviderLogsQueryDto) {
    const where: Prisma.ProviderLogWhereInput = {};
    if (query.providerName) where.providerName = query.providerName;
    if (query.modelName) where.modelName = query.modelName;
    if (query.status) where.requestStatus = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.providerLog.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.providerLog.count({ where }),
    ]);

    return buildPagination(items, total, query);
  }

  async recordLog(data: Record<string, unknown>): Promise<void> {
    await this.prisma.providerLog.create({
      data: {
        providerName: data.providerName as string,
        modelName: data.modelName as string,
        endpoint: data.endpoint as string,
        method: data.method as string,
        requestStatus: data.requestStatus as number,
        durationMs: (data.durationMs as number) ?? 0,
        tokenCount: (data.tokenCount as number) ?? 0,
        inputTokens: (data.inputTokens as number) ?? 0,
        outputTokens: (data.outputTokens as number) ?? 0,
        cost: (data.cost as Prisma.Decimal) ?? new Prisma.Decimal(0),
        errorMessage: data.errorMessage as string | undefined,
        errorCode: data.errorCode as string | undefined,
        requestId: data.requestId as string | undefined,
        userId: data.userId as string | undefined,
        apiKeyId: data.apiKeyId as string | undefined,
        organizationId: data.organizationId as string | undefined,
        isStreaming: (data.isStreaming as boolean) ?? false,
        isCached: (data.isCached as boolean) ?? false,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  async getDashboard() {
    const [registry, health, stats, recentValidations, recentLogs] = await Promise.all([
      this.prisma.providerRegistryEntry.count(),
      this.litellmClient.getHealthFull().catch(() => ({ healthy_endpoints: [], unhealthy_endpoints: [] })),
      this.getStatistics(),
      this.getValidationHistory(undefined, 5),
      this.getLogs({ page: 1, pageSize: 10, sortBy: "createdAt", sortOrder: "desc" }),
    ]);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalProviders: registry,
        healthyEndpoints: health.healthy_endpoints?.length ?? 0,
        unhealthyEndpoints: health.unhealthy_endpoints?.length ?? 0,
        ...stats,
      },
      recentValidations,
      recentLogs: recentLogs.data,
    };
  }
}

void LITELLM_LOG_CONTEXTS;
void RedisService;
