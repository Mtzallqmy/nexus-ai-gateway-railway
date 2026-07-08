/**
 * LiteLLM Circuit Breaker
 *
 * Per-provider circuit breaker. After N consecutive failures, the circuit
 * opens and short-circuits requests for a cooldown period. After the
 * cooldown, the circuit enters HALF_OPEN and lets one probe request
 * through; if it succeeds, the circuit closes; if it fails, it reopens.
 *
 * State is kept in-memory (single-process). Phase 4 can move to Redis
 * for multi-instance coordination.
 */
import { Injectable, Logger } from "@nestjs/common";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type { ICircuitBreaker } from "./litellm.interfaces";
import type { CircuitBreakerState } from "./litellm.types";

interface BreakerEntry {
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureAt: number | null;
  openedAt: number | null;
}

@Injectable()
export class LiteLLMCircuitBreaker implements ICircuitBreaker {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.CIRCUIT);
  private readonly entries = new Map<string, BreakerEntry>();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(failureThreshold = 5, resetTimeoutMs = 60_000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  getState(providerKey: string): CircuitBreakerState {
    const entry = this.entries.get(providerKey);
    if (!entry) return "CLOSED";
    this.maybeHalfOpen(entry);
    return entry.state;
  }

  isOpen(providerKey: string): boolean {
    return this.getState(providerKey) === "OPEN";
  }

  recordSuccess(providerKey: string): void {
    const entry = this.entries.get(providerKey);
    if (!entry) return;
    if (entry.state !== "CLOSED") {
      this.logger.log(`Circuit CLOSED for '${providerKey}' (recovered)`);
    }
    entry.state = "CLOSED";
    entry.failureCount = 0;
    entry.openedAt = null;
    entry.lastFailureAt = null;
  }

  /**
   * Records a failure. Returns true if the circuit just transitioned to OPEN.
   */
  recordFailure(providerKey: string): boolean {
    let entry = this.entries.get(providerKey);
    if (!entry) {
      entry = { state: "CLOSED", failureCount: 0, lastFailureAt: null, openedAt: null };
      this.entries.set(providerKey, entry);
    }
    entry.failureCount++;
    entry.lastFailureAt = Date.now();
    this.maybeHalfOpen(entry);

    if (entry.state === "HALF_OPEN") {
      // Probe failed — reopen
      entry.state = "OPEN";
      entry.openedAt = Date.now();
      this.logger.warn(`Circuit re-OPENED for '${providerKey}' (HALF_OPEN probe failed)`);
      return true;
    }

    if (entry.failureCount >= this.failureThreshold && entry.state !== "OPEN") {
      entry.state = "OPEN";
      entry.openedAt = Date.now();
      this.logger.warn(
        `Circuit OPENED for '${providerKey}' (failures=${entry.failureCount} >= threshold=${this.failureThreshold})`
      );
      return true;
    }
    return false;
  }

  reset(providerKey?: string): void {
    if (providerKey) {
      this.entries.delete(providerKey);
      this.logger.log(`Circuit manually reset for '${providerKey}'`);
    } else {
      this.entries.clear();
      this.logger.log(`All circuits manually reset`);
    }
  }

  getAll(): Array<{
    key: string;
    state: CircuitBreakerState;
    failureCount: number;
    lastFailureAt: string | null;
  }> {
    return Array.from(this.entries.entries()).map(([key, entry]) => ({
      key,
      state: entry.state,
      failureCount: entry.failureCount,
      lastFailureAt: entry.lastFailureAt ? new Date(entry.lastFailureAt).toISOString() : null,
    }));
  }

  private maybeHalfOpen(entry: BreakerEntry): void {
    if (entry.state === "OPEN" && entry.openedAt !== null) {
      if (Date.now() - entry.openedAt >= this.resetTimeoutMs) {
        entry.state = "HALF_OPEN";
        this.logger.log(`Circuit HALF_OPEN (probe allowed)`);
      }
    }
  }
}
