import type { IRetryPolicy } from "./litellm.interfaces";
export declare class LiteLLMRetryPolicy implements IRetryPolicy {
    private readonly maxAttempts;
    private readonly baseDelayMs;
    private readonly maxDelayMs;
    constructor(maxAttempts?: number, baseDelayMs?: number);
    shouldRetry(attempt: number, error: unknown): boolean;
    getDelay(attempt: number): number;
    getMaxAttempts(): number;
}
