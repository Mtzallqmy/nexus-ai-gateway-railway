/**
 * LiteLLM Request Router
 *
 * Routes incoming inference requests through the LiteLLM client.
 *
 * IMPORTANT: The router NEVER contacts AI providers directly.
 * It only forwards requests to the LiteLLM proxy via LiteLLMClient.
 *
 * Responsibilities:
 *   - Validate the requested model exists in our model cache
 *   - Apply model aliases (e.g. "gpt-4" → "gpt-4o")
 *   - Forward to LiteLLMClient with retry + circuit breaker (handled in client)
 *   - Record usage counters on success
 *   - Stream chunks back to the caller as an async iterable
 */
import { Injectable, Logger } from "@nestjs/common";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { ILiteLLMRouter } from "./litellm.interfaces";
import type {
  LiteLLMChatCompletionRequest,
  LiteLLMChatCompletionResponse,
  LiteLLMChatCompletionChunk,
} from "./litellm.types";
import type { LiteLLMClient } from "./litellm.client";
import type { LiteLLMRepository } from "./litellm.repository";
import { randomUUID } from "crypto";

@Injectable()
export class LiteLLMRouter implements ILiteLLMRouter {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.ROUTER);

  constructor(
    private readonly client: LiteLLMClient,
    private readonly repo: LiteLLMRepository
  ) {}

  async routeChatCompletion(req: LiteLLMChatCompletionRequest): Promise<LiteLLMChatCompletionResponse> {
    this.logger.log(`Routing chat completion → model=${req.model} stream=false`);
    const startedAt = Date.now();

    try {
      const response = await this.client.chatCompletion(req);
      const duration = Date.now() - startedAt;

      // Record usage
      await this.recordUsage(req.model, response.usage?.total_tokens ?? 0, response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0, false).catch((e) =>
        this.logger.warn(`Usage recording failed: ${(e as Error).message}`)
      );

      this.logger.debug?.(`Chat completion completed in ${duration}ms (tokens=${response.usage?.total_tokens})`);
      return response;
    } catch (err) {
      await this.recordUsage(req.model, 0, 0, 0, true).catch(() => void 0);
      throw err;
    }
  }

  async *routeChatCompletionStream(req: LiteLLMChatCompletionRequest): AsyncIterable<LiteLLMChatCompletionChunk> {
    this.logger.log(`Routing chat completion → model=${req.model} stream=true`);
    let chunkCount = 0;

    try {
      for await (const chunk of this.client.chatCompletionStream(req)) {
        chunkCount++;
        yield chunk;
      }
      this.logger.debug?.(`Stream completed (${chunkCount} chunks)`);
    } catch (err) {
      this.logger.error(`Stream failed after ${chunkCount} chunks: ${(err as Error).message}`);
      throw err;
    }
  }

  async routeEmbeddings(model: string, input: string | string[]): Promise<unknown> {
    this.logger.log(`Routing embeddings → model=${model} items=${Array.isArray(input) ? input.length : 1}`);
    const result = await this.client.embeddings(model, input);

    await this.recordUsage(model, 0, 0, 0, false).catch(() => void 0);

    return result;
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================
  private async recordUsage(
    modelName: string,
    totalTokens: number,
    inputTokens: number,
    outputTokens: number,
    isError: boolean
  ): Promise<void> {
    await this.repo.incrementUsage({
      counterId: randomUUID(),
      modelName,
      requestCount: 1,
      tokenCount: totalTokens,
      inputTokens,
      outputTokens,
      errorCount: isError ? 1 : 0,
    });
  }
}
