import { ProvidersService } from "./providers.service";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { RedisService } from "../../infrastructure/redis/redis.service";
import { ConfigService } from "@nestjs/config";
import { PROVIDER_CATALOG } from "./registry/provider-catalog";

const mockPrisma = {
  providerRegistryEntry: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  apiKeyValidation: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  providerDiscoveryResult: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  provider: {
    findFirst: jest.fn(),
  },
  providerHealth: {
    findMany: jest.fn(),
  },
  providerLog: {
    count: jest.fn(),
    aggregate: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    groupBy: jest.fn(),
  },
};

const mockRedis = {};
const mockConfig = { get: jest.fn(() => null) };
const mockLiteLLMClient = {
  chatCompletion: jest.fn(),
  chatCompletionStream: jest.fn(),
  getModels: jest.fn(),
  getHealthFull: jest.fn(),
  embeddings: jest.fn(),
};

describe("ProvidersService", () => {
  let service: ProvidersService;

  beforeEach(() => {
    service = new ProvidersService(
      mockPrisma as never,
      mockRedis as never,
      mockConfig as never,
      mockLiteLLMClient as never
    );
    jest.clearAllMocks();
    mockPrisma.providerRegistryEntry.upsert.mockResolvedValue({});
  });

  describe("getCatalog", () => {
    it("should return all 20 providers from the catalog", async () => {
      const catalog = await service.getCatalog();
      expect(catalog).toHaveLength(20);
      const slugs = catalog.map((p) => p.slug);
      expect(slugs).toContain("openai");
      expect(slugs).toContain("anthropic");
      expect(slugs).toContain("google");
      expect(slugs).toContain("groq");
      expect(slugs).toContain("ollama");
    });
  });

  describe("validateApiKey", () => {
    it("should return VALID when LiteLLM chat completion succeeds", async () => {
      mockLiteLLMClient.chatCompletion.mockResolvedValue({
        id: "test",
        choices: [{ message: { content: "Hi" } }],
        usage: { total_tokens: 5 },
      });

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test-key-1234567890",
        modelToTest: "gpt-4o",
      });

      expect(result.status).toBe("VALID");
      expect(result.isValid).toBe(true);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should return INVALID on 401", async () => {
      const err: unknown = new Error("Invalid API key");
      (err as Record<string, unknown>).status = 401;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-bad-key",
      });

      expect(result.status).toBe("INVALID");
      expect(result.isValid).toBe(false);
      expect(result.httpStatus).toBe(401);
    });

    it("should return RATE_LIMITED on 429", async () => {
      const err: unknown = new Error("Rate limit exceeded");
      (err as Record<string, unknown>).status = 429;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "anthropic",
        apiKey: "sk-ant-test",
      });

      expect(result.status).toBe("RATE_LIMITED");
      expect(result.retryAfter).toBe(60);
    });

    it("should return BILLING_REQUIRED on 402", async () => {
      const err: unknown = new Error("Payment required");
      (err as Record<string, unknown>).status = 402;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("BILLING_REQUIRED");
    });

    it("should return NETWORK_ERROR on ECONNRESET", async () => {
      const err: unknown = new Error("Connection reset");
      (err as Record<string, unknown>).code = "ECONNRESET";
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("NETWORK_ERROR");
    });

    it("should return TIMEOUT on abort", async () => {
      const err: unknown = new Error("timeout");
      (err as Record<string, unknown>).code = "ABORT_ERR";
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("TIMEOUT");
    });

    it("should return PERMISSION_DENIED on 403", async () => {
      const err: unknown = new Error("Forbidden");
      (err as Record<string, unknown>).status = 403;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("PERMISSION_DENIED");
    });

    it("should return REGION_BLOCKED on 403 with 'region' in message", async () => {
      const err: unknown = new Error("Region blocked");
      (err as Record<string, unknown>).status = 403;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("REGION_BLOCKED");
    });

    it("should return INTERNAL_ERROR on 500", async () => {
      const err: unknown = new Error("Internal server error");
      (err as Record<string, unknown>).status = 500;
      mockLiteLLMClient.chatCompletion.mockRejectedValue(err);

      const result = await service.validateApiKey({
        providerName: "openai",
        apiKey: "sk-test",
      });

      expect(result.status).toBe("INTERNAL_ERROR");
    });
  });

  describe("discoverProvider", () => {
    it("should discover models from LiteLLM", async () => {
      mockLiteLLMClient.getModels.mockResolvedValue({
        data: [
          { id: "gpt-4o", litellm_params: { model: "openai/gpt-4o" }, object: "model", created: 0, owned_by: "openai" },
          { id: "claude-3", litellm_params: { model: "anthropic/claude-3" }, object: "model", created: 0, owned_by: "anthropic" },
        ],
        object: "list",
      });

      const result = await service.discoverProvider({
        providerName: "openai",
        apiKey: "sk-test",
        deep: false,
      });

      expect(result.status).toBe("COMPLETED");
      expect(result.availableModels).toContain("gpt-4o");
      expect(result.availableModels).not.toContain("claude-3");
    });
  });

  describe("getStatistics", () => {
    it("should return aggregated statistics", async () => {
      mockPrisma.providerLog.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(5);
      mockPrisma.providerLog.aggregate
        .mockResolvedValueOnce({ _sum: { tokenCount: 50000 } })
        .mockResolvedValueOnce({ _sum: { cost: { toString: () => "12.50" } } })
        .mockResolvedValueOnce({ _avg: { durationMs: 250 } });

      const result = await service.getStatistics();

      expect(result.totalRequests).toBe(100);
      expect(result.totalErrors).toBe(5);
      expect(result.totalTokens).toBe(50000);
      expect(result.errorRate).toBe(5);
      expect(result.successRate).toBe(95);
      expect(result.avgLatencyMs).toBe(250);
    });
  });
});

void PROVIDER_CATALOG;
