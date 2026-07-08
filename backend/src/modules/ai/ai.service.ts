/**
 * Unified AI Service
 *
 * The single entry point for all AI operations on the platform.
 * Routes requests through LiteLLMRouter → LiteLLMClient → LiteLLM Proxy.
 *
 * IMPORTANT: This service NEVER contacts AI providers directly.
 * All inference goes through LiteLLM.
 *
 * Implements OpenAI-compatible endpoints so any client using the
 * OpenAI SDK can use this platform without changes.
 */
import { Injectable, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { LiteLLMRouter } from "../litellm/litellm.router";
import type { LiteLLMClient } from "../litellm/litellm.client";
import type { ChatCompletionDto, EmbeddingsDto, ImageGenerationDto, TextToSpeechDto, ModerationDto } from "./dto/ai.dto";
import { randomUUID } from "crypto";

@Injectable()
export class AiService {
  private readonly logger = new Logger("AiService");

  constructor(
    private readonly router: LiteLLMRouter,
    private readonly client: LiteLLMClient,
    private readonly prisma: PrismaService
  ) {
    this.logger.log("Unified AI service initialized");
  }

  // ============================================================
  // CHAT COMPLETIONS (OpenAI-compatible)
  // ============================================================

  async chatCompletion(dto: ChatCompletionDto, userId?: string, apiKeyId?: string) {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[chat] model=${dto.model} stream=${dto.stream} user=${userId ?? "api"}`);

    try {
      const response = await this.router.routeChatCompletion({
        model: dto.model,
        messages: dto.messages.map((m) => ({
          role: m.role,
          content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        })),
        temperature: dto.temperature,
        max_tokens: dto.max_tokens ?? dto.max_completion_tokens,
        top_p: dto.top_p,
        stream: false, // Non-streaming handled here
        stop: dto.stop,
        presence_penalty: dto.presence_penalty,
        frequency_penalty: dto.frequency_penalty,
        user: dto.user,
        metadata: dto.metadata,
      });

      const latencyMs = Date.now() - startedAt;
      const tokens = response.usage?.total_tokens ?? 0;
      const cost = this.estimateCost(dto.model, response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0);

      // Record log
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/chat/completions",
        method: "POST",
        requestStatus: 200,
        durationMs: latencyMs,
        tokenCount: tokens,
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        cost,
        requestId,
        userId,
        apiKeyId,
        isStreaming: false,
      }).catch(() => void 0);

      // Return OpenAI-compatible response
      return {
        id: response.id ?? `chatcmpl-${requestId}`,
        object: "chat.completion",
        created: response.created ?? Math.floor(Date.now() / 1000),
        model: dto.model,
        choices: response.choices ?? [],
        usage: response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        system_fingerprint: response.system_fingerprint,
        _metadata: {
          requestId,
          latencyMs,
          cost: Number(cost),
          provider: dto.model.split("/")[0] ?? "unknown",
        },
      };
    } catch (err) {
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/chat/completions",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
        isStreaming: false,
      }).catch(() => void 0);
      throw err;
    }
  }

  /**
   * Streaming chat completion — yields SSE chunks in OpenAI format.
   */
  async *chatCompletionStream(dto: ChatCompletionDto, userId?: string, apiKeyId?: string): AsyncGenerator<string> {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[chat-stream] model=${dto.model} user=${userId ?? "api"}`);

    // Send initial heartbeat
    yield `: heartbeat\n\n`;

    try {
      for await (const chunk of this.router.routeChatCompletionStream({
        model: dto.model,
        messages: dto.messages.map((m) => ({
          role: m.role,
          content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
        })),
        temperature: dto.temperature,
        max_tokens: dto.max_tokens ?? dto.max_completion_tokens,
        top_p: dto.top_p,
        stream: true,
        stop: dto.stop,
        presence_penalty: dto.presence_penalty,
        frequency_penalty: dto.frequency_penalty,
        user: dto.user,
      })) {
        // Convert to OpenAI SSE format
        const sseChunk = {
          id: chunk.id ?? `chatcmpl-${requestId}`,
          object: "chat.completion.chunk",
          created: chunk.created ?? Math.floor(Date.now() / 1000),
          model: dto.model,
          choices: chunk.choices ?? [],
        };
        yield `data: ${JSON.stringify(sseChunk)}\n\n`;
      }

      // Send [DONE] marker
      yield `data: [DONE]\n\n`;

      // Record log
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/chat/completions",
        method: "POST",
        requestStatus: 200,
        durationMs: Date.now() - startedAt,
        requestId,
        userId,
        apiKeyId,
        isStreaming: true,
      }).catch(() => void 0);
    } catch (err) {
      // Send error as SSE
      const errorChunk = {
        error: {
          message: (err as Error).message,
          type: "internal_error",
          code: "stream_error",
        },
      };
      yield `data: ${JSON.stringify(errorChunk)}\n\n`;
      yield `data: [DONE]\n\n`;

      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/chat/completions",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
        isStreaming: true,
      }).catch(() => void 0);
    }
  }

  // ============================================================
  // EMBEDDINGS (OpenAI-compatible)
  // ============================================================

  async embeddings(dto: EmbeddingsDto, userId?: string, apiKeyId?: string) {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[embeddings] model=${dto.model} user=${userId ?? "api"}`);

    try {
      const result = await this.router.routeEmbeddings(dto.model, dto.input);

      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/embeddings",
        method: "POST",
        requestStatus: 200,
        durationMs: Date.now() - startedAt,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);

      return result;
    } catch (err) {
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/embeddings",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);
      throw err;
    }
  }

  // ============================================================
  // IMAGE GENERATION (OpenAI-compatible)
  // ============================================================

  async generateImages(dto: ImageGenerationDto, userId?: string, apiKeyId?: string) {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[images] model=${dto.model} prompt="${dto.prompt.slice(0, 50)}..." user=${userId ?? "api"}`);

    try {
      const result = await this.client.generateImages(dto.model, dto.prompt, dto.n, dto.size);

      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/images/generations",
        method: "POST",
        requestStatus: 200,
        durationMs: Date.now() - startedAt,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);

      return {
        ...(result as object),
        _metadata: { requestId, latencyMs: Date.now() - startedAt },
      };
    } catch (err) {
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/images/generations",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);
      throw err;
    }
  }

  // ============================================================
  // TEXT TO SPEECH (OpenAI-compatible)
  // ============================================================

  async textToSpeech(dto: TextToSpeechDto, userId?: string, apiKeyId?: string): Promise<Buffer> {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[tts] model=${dto.model} voice=${dto.voice} user=${userId ?? "api"}`);

    try {
      const arrayBuffer = await this.client.textToSpeech(dto.model, dto.input, dto.voice);
      const audioBuffer = Buffer.from(arrayBuffer);

      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/audio/speech",
        method: "POST",
        requestStatus: 200,
        durationMs: Date.now() - startedAt,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);

      return audioBuffer;
    } catch (err) {
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/audio/speech",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);
      throw err;
    }
  }

  // ============================================================
  // MODERATION (OpenAI-compatible)
  // ============================================================

  async moderation(dto: ModerationDto, userId?: string, apiKeyId?: string) {
    const startedAt = Date.now();
    const requestId = randomUUID();
    this.logger.log(`[moderation] model=${dto.model} user=${userId ?? "api"}`);

    try {
      const result = await this.client.moderate(dto.model, dto.input);

      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/moderations",
        method: "POST",
        requestStatus: 200,
        durationMs: Date.now() - startedAt,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);

      return result;
    } catch (err) {
      await this.recordLog({
        providerName: dto.model.split("/")[0] ?? "unknown",
        modelName: dto.model,
        endpoint: "/v1/moderations",
        method: "POST",
        requestStatus: 500,
        durationMs: Date.now() - startedAt,
        errorMessage: (err as Error).message,
        requestId,
        userId,
        apiKeyId,
      }).catch(() => void 0);
      throw err;
    }
  }

  // ============================================================
  // MODELS LIST (OpenAI-compatible)
  // ============================================================

  async listModels() {
    const response = await this.client.getModels();
    return {
      object: "list",
      data: response.data ?? [],
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private estimateCost(model: string, inputTokens: number, outputTokens: number): Prisma.Decimal {
    // Basic cost estimation — real pricing would come from provider registry
    const costPer1k: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 0.005, output: 0.015 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
      "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
      "claude-3-opus": { input: 0.015, output: 0.075 },
      "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
      "gemini-1.5-flash": { input: 0.00035, output: 0.00105 },
    };
    const pricing = costPer1k[model] ?? { input: 0.001, output: 0.002 };
    const cost = (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
    return new Prisma.Decimal(cost.toFixed(6));
  }

  private async recordLog(data: Record<string, unknown>): Promise<void> {
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
        requestId: data.requestId as string | undefined,
        userId: data.userId as string | undefined,
        apiKeyId: data.apiKeyId as string | undefined,
        isStreaming: (data.isStreaming as boolean) ?? false,
        isCached: (data.isCached as boolean) ?? false,
        metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      },
    });
  }
}
