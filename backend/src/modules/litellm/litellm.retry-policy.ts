/**
 * LiteLLM Retry Policy
 *
 * Determines whether to retry a failed request and computes the
 * backoff delay. Uses exponential backoff with jitter.
 *
 * Retryable conditions:
 *   - HTTP 5xx from LiteLLM
 *   - HTTP 429 (rate limited)
 *   - Network errors (ECONNRESET, ETIMEDOUT, ENOTFOUND)
 *   - Stream aborts
 *
 * Non-retryable:
 *   - HTTP 4xx (except 429) — client error, won't change
 *   - Invalid request body
 */
import { Injectable } from "@nestjs/common";
import { LITELLM_DEFAULTS } from "./litellm.constants";
import type { IRetryPolicy } from "./litellm.interfaces";

interface ErrorLike {
  status?: number;
  code?: string;
  name?: string;
  message?: string;
}

@Injectable()
export class LiteLLMRetryPolicy implements IRetryPolicy {
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs = LITELLM_DEFAULTS.RETRY_MAX_DELAY_MS;

  constructor(maxAttempts?: number, baseDelayMs?: number) {
    this.maxAttempts = maxAttempts ?? LITELLM_DEFAULTS.RETRY_ATTEMPTS;
    this.baseDelayMs = baseDelayMs ?? LITELLM_DEFAULTS.RETRY_BASE_DELAY_MS;
  }

  shouldRetry(attempt: number, error: unknown): boolean {
    if (attempt >= this.maxAttempts) return false;
    const err = error as ErrorLike;
    if (!err) return false;

    // Network / connection errors
    const networkCodes = ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED", "EPIPE", "EAI_AGAIN"];
    if (err.code && networkCodes.includes(err.code)) return true;
    if (err.name === "AbortError") return true;
    if (err.name === "TypeError" && typeof err.message === "string" && err.message.includes("fetch")) return true;

    // HTTP status codes
    const status = err.status;
    if (typeof status === "number") {
      if (status >= 500 && status < 600) return true;
      if (status === 429) return true;
      if (status === 408) return true; // Request Timeout
    }
    return false;
  }

  /**
   * Exponential backoff with full jitter:
   *   delay = random(0, base * 2^attempt)
   * Capped at maxDelayMs.
   */
  getDelay(attempt: number): number {
    const ceiling = Math.min(this.baseDelayMs * Math.pow(2, attempt), this.maxDelayMs);
    return Math.floor(Math.random() * ceiling);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}
