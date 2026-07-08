import { LiteLLMRetryPolicy } from "./litellm.retry-policy";

describe("LiteLLMRetryPolicy", () => {
  let policy: LiteLLMRetryPolicy;

  beforeEach(() => {
    policy = new LiteLLMRetryPolicy(3, 100); // 3 attempts, 100ms base
  });

  it("retries on 5xx errors", () => {
    expect(policy.shouldRetry(0, { status: 500 } as never)).toBe(true);
    expect(policy.shouldRetry(1, { status: 502 } as never)).toBe(true);
    expect(policy.shouldRetry(2, { status: 503 } as never)).toBe(true);
  });

  it("retries on 429 (rate limited)", () => {
    expect(policy.shouldRetry(0, { status: 429 } as never)).toBe(true);
  });

  it("retries on 408 (timeout)", () => {
    expect(policy.shouldRetry(0, { status: 408 } as never)).toBe(true);
  });

  it("does NOT retry on 4xx (except 429/408)", () => {
    expect(policy.shouldRetry(0, { status: 400 } as never)).toBe(false);
    expect(policy.shouldRetry(0, { status: 401 } as never)).toBe(false);
    expect(policy.shouldRetry(0, { status: 403 } as never)).toBe(false);
    expect(policy.shouldRetry(0, { status: 404 } as never)).toBe(false);
  });

  it("retries on network errors (ECONNRESET, ETIMEDOUT, etc.)", () => {
    expect(policy.shouldRetry(0, { code: "ECONNRESET" } as never)).toBe(true);
    expect(policy.shouldRetry(0, { code: "ETIMEDOUT" } as never)).toBe(true);
    expect(policy.shouldRetry(0, { code: "ENOTFOUND" } as never)).toBe(true);
    expect(policy.shouldRetry(0, { code: "ECONNREFUSED" } as never)).toBe(true);
    expect(policy.shouldRetry(0, { code: "EPIPE" } as never)).toBe(true);
  });

  it("retries on AbortError", () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    expect(policy.shouldRetry(0, err as never)).toBe(true);
  });

  it("stops after max attempts", () => {
    expect(policy.shouldRetry(3, { status: 500 } as never)).toBe(false);
    expect(policy.shouldRetry(4, { status: 500 } as never)).toBe(false);
  });

  it("getDelay returns exponential backoff with jitter", () => {
    const d0 = policy.getDelay(0);
    const d1 = policy.getDelay(1);
    const d2 = policy.getDelay(2);

    // With base=100, max delay for attempt 0 = 100, attempt 1 = 200, attempt 2 = 400
    expect(d0).toBeGreaterThanOrEqual(0);
    expect(d0).toBeLessThanOrEqual(100);
    expect(d1).toBeGreaterThanOrEqual(0);
    expect(d1).toBeLessThanOrEqual(200);
    expect(d2).toBeGreaterThanOrEqual(0);
    expect(d2).toBeLessThanOrEqual(400);
  });

  it("getMaxAttempts returns configured value", () => {
    expect(policy.getMaxAttempts()).toBe(3);
  });
});
