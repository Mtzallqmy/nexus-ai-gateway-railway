/**
 * LiteLLM HTTP Client
 *
 * The ONLY class in the platform that sends HTTP requests to the LiteLLM proxy.
 * It enforces:
 *   - Authorization with the LiteLLM master key
 *   - Request timeout (with stream-timeout for streaming requests)
 *   - Retry policy (exponential backoff with jitter)
 *   - Circuit breaker (per provider/model)
 *   - Connection pool (bounded concurrency)
 *   - Logging of every request, response, retry, timeout, error
 *
 * IMPORTANT: This client NEVER talks to AI providers directly.
 * It only ever talks to the LiteLLM proxy at LITELLM_BASE_URL.
 */
import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { LITELLM_ENDPOINTS, LITELLM_HEADERS, LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { LiteLLMConfig } from "./litellm.types";
import type {
  LiteLLMChatCompletionRequest,
  LiteLLMChatCompletionResponse,
  LiteLLMChatCompletionChunk,
  LiteLLMHealthResponse,
  LiteLLMLivenessResponse,
  LiteLLMReadinessResponse,
  LiteLLMModelListResponse,
  LiteLLMVersionResponse,
  LiteLLMReloadResponse,
} from "./litellm.types";
import type { ILiteLLMClient } from "./litellm.interfaces";
import { LiteLLMRetryPolicy } from "./litellm.retry-policy";
import { LiteLLMCircuitBreaker } from "./litellm.circuit-breaker";
import { LiteLLMConnectionPool } from "./litellm.connection-pool";

interface HttpError extends Error {
  status?: number;
  code?: string;
}

@Injectable()
export class LiteLLMClient implements ILiteLLMClient {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.CLIENT);
  private readonly config: LiteLLMConfig;
  private readonly retry: LiteLLMRetryPolicy;
  private readonly breaker: LiteLLMCircuitBreaker;
  private readonly pool: LiteLLMConnectionPool;

  constructor(
    config: LiteLLMConfig,
    retry: LiteLLMRetryPolicy,
    breaker: LiteLLMCircuitBreaker,
    pool: LiteLLMConnectionPool
  ) {
    this.config = config;
    this.retry = retry;
    this.breaker = breaker;
    this.pool = pool;
    this.logger.log(`LiteLLM client initialized → ${config.baseUrl}`);
  }

  // ============================================================
  // MODELS
  // ============================================================
  async getModels(): Promise<LiteLLMModelListResponse> {
    return this.request<LiteLLMModelListResponse>("GET", LITELLM_ENDPOINTS.MODELS);
  }

  // ============================================================
  // VERSION
  // ============================================================
  async getVersion(): Promise<LiteLLMVersionResponse> {
    return this.request<LiteLLMVersionResponse>("GET", LITELLM_ENDPOINTS.VERSION);
  }

  // ============================================================
  // HEALTH
  // ============================================================
  async getHealthLiveness(): Promise<LiteLLMLivenessResponse> {
    return this.request<LiteLLMLivenessResponse>("GET", LITELLM_ENDPOINTS.HEALTH_LIVENESS, undefined, 5_000);
  }

  async getHealthReadiness(): Promise<LiteLLMReadinessResponse> {
    return this.request<LiteLLMReadinessResponse>("GET", LITELLM_ENDPOINTS.HEALTH_READINESS, undefined, 5_000);
  }

  async getHealthFull(): Promise<LiteLLMHealthResponse> {
    return this.request<LiteLLMHealthResponse>("GET", LITELLM_ENDPOINTS.HEALTH_FULL, undefined, 10_000);
  }

  // ============================================================
  // RELOAD CONFIG
  // ============================================================
  async reload(): Promise<LiteLLMReloadResponse> {
    return this.request<LiteLLMReloadResponse>("POST", LITELLM_ENDPOINTS.RELOAD);
  }

  // ============================================================
  // CHAT COMPLETIONS (non-streaming)
  // ============================================================
  async chatCompletion(req: LiteLLMChatCompletionRequest): Promise<LiteLLMChatCompletionResponse> {
    const providerKey = req.model;
    if (this.breaker.isOpen(providerKey)) {
      throw new ServiceUnavailableException(`Circuit breaker open for model '${providerKey}'`);
    }
    try {
      const result = await this.request<LiteLLMChatCompletionResponse>(
        "POST",
        LITELLM_ENDPOINTS.CHAT_COMPLETIONS,
        req
      );
      this.breaker.recordSuccess(providerKey);
      return result;
    } catch (err) {
      this.breaker.recordFailure(providerKey);
      throw err;
    }
  }

  // ============================================================
  // CHAT COMPLETIONS (streaming)
  // ============================================================
  async *chatCompletionStream(
    req: LiteLLMChatCompletionRequest
  ): AsyncIterable<LiteLLMChatCompletionChunk> {
    const providerKey = req.model;
    if (this.breaker.isOpen(providerKey)) {
      throw new ServiceUnavailableException(`Circuit breaker open for model '${providerKey}'`);
    }

    const url = `${this.config.baseUrl}${LITELLM_ENDPOINTS.CHAT_COMPLETIONS}`;
    const startedAt = Date.now();
    this.logger.log(`STREAM POST ${LITELLM_ENDPOINTS.CHAT_COMPLETIONS} model=${req.model}`);

    try {
      const response = await this.pool.withConnection(() =>
        fetch(url, {
          method: "POST",
          headers: this.buildHeaders(true),
          body: JSON.stringify({ ...req, stream: true }),
          signal: AbortSignal.timeout(this.config.streamTimeoutMs),
        })
      );

      if (!response.ok) {
        const err = await this.buildHttpError(response);
        this.breaker.recordFailure(providerKey);
        throw err;
      }

      if (!response.body) {
        throw new Error("No response body for stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") return;
            try {
              yield JSON.parse(data) as LiteLLMChatCompletionChunk;
            } catch (parseErr) {
              this.logger.warn(`Stream parse error: ${(parseErr as Error).message}`);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      this.breaker.recordSuccess(providerKey);
      this.logger.debug?.(`STREAM completed in ${Date.now() - startedAt}ms`);
    } catch (err) {
      this.breaker.recordFailure(providerKey);
      this.logger.error(`STREAM failed: ${(err as Error).message}`);
      throw err;
    }
  }

  // ============================================================
  // EMBEDDINGS
  // ============================================================
  async embeddings(model: string, input: string | string[]): Promise<unknown> {
    return this.request<unknown>("POST", LITELLM_ENDPOINTS.EMBEDDINGS, { model, input });
  }

  // ============================================================
  // IMAGE GENERATION
  // ============================================================
  async generateImages(model: string, prompt: string, n = 1, size?: string): Promise<unknown> {
    return this.request<unknown>("POST", "/v1/images/generations", { model, prompt, n, size });
  }

  // ============================================================
  // TEXT TO SPEECH
  // ============================================================
  async textToSpeech(model: string, input: string, voice: string): Promise<ArrayBuffer> {
    const url = `${this.config.baseUrl}/v1/audio/speech`;
    const response = await this.pool.withConnection(() =>
      fetch(url, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify({ model, input, voice }),
        signal: AbortSignal.timeout(this.config.requestTimeoutMs),
      })
    );
    if (!response.ok) throw await this.buildHttpError(response);
    return response.arrayBuffer();
  }

  // ============================================================
  // MODERATION
  // ============================================================
  async moderate(model: string, input: string | string[]): Promise<unknown> {
    return this.request<unknown>("POST", "/v1/moderations", { model, input });
  }

  // ============================================================
  // CORE REQUEST ENGINE — with retry + timeout + pool + logging
  // ============================================================
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    timeoutMs?: number
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const timeout = timeoutMs ?? this.config.requestTimeoutMs;
    const startedAt = Date.now();
    const requestId = `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const logContext = `${method} ${path} [${requestId}]`;

    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.retry.getMaxAttempts()) {
      try {
        this.logger.debug?.(`${logContext} attempt=${attempt + 1}`);

        const result = await this.pool.withConnection(async () => {
          const response = await fetch(url, {
            method,
            headers: this.buildHeaders(),
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(timeout),
          });

          if (!response.ok) {
            throw await this.buildHttpError(response);
          }

          return (await response.json()) as T;
        });

        const duration = Date.now() - startedAt;
        this.logger.debug?.(`${logContext} → 200 OK in ${duration}ms`);
        return result;
      } catch (err) {
        lastError = err;
        const httpErr = err as HttpError;

        if (!this.retry.shouldRetry(attempt, err)) {
          this.logger.error(`${logContext} → ${httpErr.status ?? "ERR"} ${httpErr.message}`);
          throw err;
        }

        const delay = this.retry.getDelay(attempt);
        this.logger.warn(
          `${logContext} → ${httpErr.status ?? "ERR"} ${httpErr.message} — retrying in ${delay}ms (attempt ${attempt + 1}/${this.retry.getMaxAttempts()})`
        );
        await this.sleep(delay);
        attempt++;
      }
    }

    this.logger.error(`${logContext} → exhausted retries`);
    throw lastError;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private buildHeaders(stream = false): Record<string, string> {
    const headers: Record<string, string> = {
      [LITELLM_HEADERS.CONTENT_TYPE]: "application/json",
      [LITELLM_HEADERS.AUTHORIZATION]: `Bearer ${this.config.masterKey}`,
      [LITELLM_HEADERS.USER_AGENT]: "moataz-ai-gateway-backend/3.0",
    };
    if (stream) headers[LITELLM_HEADERS.ACCEPT] = "text/event-stream";
    return headers;
  }

  private async buildHttpError(response: Response): Promise<HttpError> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      try {
        body = await response.text();
      } catch {
        body = undefined;
      }
    }
    let message: string;
    if (body && typeof body === "object" && "message" in body) {
      message = String((body as { message: unknown }).message);
    } else if (typeof body === "string" && body.length > 0) {
      message = body;
    } else {
      message = `HTTP ${response.status} ${response.statusText}`;
    }
    const err: HttpError = new Error(message);
    err.status = response.status;
    return err;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
