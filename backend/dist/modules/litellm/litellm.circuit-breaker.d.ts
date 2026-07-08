import type { ICircuitBreaker } from "./litellm.interfaces";
import type { CircuitBreakerState } from "./litellm.types";
export declare class LiteLLMCircuitBreaker implements ICircuitBreaker {
    private readonly logger;
    private readonly entries;
    private readonly failureThreshold;
    private readonly resetTimeoutMs;
    constructor(failureThreshold?: number, resetTimeoutMs?: number);
    getState(providerKey: string): CircuitBreakerState;
    isOpen(providerKey: string): boolean;
    recordSuccess(providerKey: string): void;
    recordFailure(providerKey: string): boolean;
    reset(providerKey?: string): void;
    getAll(): Array<{
        key: string;
        state: CircuitBreakerState;
        failureCount: number;
        lastFailureAt: string | null;
    }>;
    private maybeHalfOpen;
}
