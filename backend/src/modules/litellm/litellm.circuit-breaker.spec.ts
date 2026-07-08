import { LiteLLMCircuitBreaker } from "./litellm.circuit-breaker";

describe("LiteLLMCircuitBreaker", () => {
  let breaker: LiteLLMCircuitBreaker;

  beforeEach(() => {
    breaker = new LiteLLMCircuitBreaker(3, 1000); // threshold=3, reset=1s
  });

  it("starts CLOSED for unknown provider", () => {
    expect(breaker.getState("openai")).toBe("CLOSED");
    expect(breaker.isOpen("openai")).toBe(false);
  });

  it("opens after threshold failures", () => {
    expect(breaker.recordFailure("openai")).toBe(false); // 1
    expect(breaker.recordFailure("openai")).toBe(false); // 2
    expect(breaker.recordFailure("openai")).toBe(true);  // 3 → OPEN
    expect(breaker.isOpen("openai")).toBe(true);
  });

  it("closes on success after being open", () => {
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    expect(breaker.getState("openai")).toBe("OPEN");

    breaker.recordSuccess("openai");
    expect(breaker.getState("openai")).toBe("CLOSED");
  });

  it("transitions to HALF_OPEN after reset timeout", async () => {
    // Use a tiny reset timeout
    const fastBreaker = new LiteLLMCircuitBreaker(1, 50); // threshold=1, reset=50ms
    fastBreaker.recordFailure("anthropic");
    expect(fastBreaker.getState("anthropic")).toBe("OPEN");

    await new Promise((r) => setTimeout(r, 60));
    expect(fastBreaker.getState("anthropic")).toBe("HALF_OPEN");
  });

  it("reopens on HALF_OPEN failure", async () => {
    const fastBreaker = new LiteLLMCircuitBreaker(1, 50);
    fastBreaker.recordFailure("anthropic");
    await new Promise((r) => setTimeout(r, 60));
    expect(fastBreaker.getState("anthropic")).toBe("HALF_OPEN");

    fastBreaker.recordFailure("anthropic");
    expect(fastBreaker.getState("anthropic")).toBe("OPEN");
  });

  it("resets individual provider", () => {
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    expect(breaker.isOpen("openai")).toBe(true);

    breaker.reset("openai");
    expect(breaker.getState("openai")).toBe("CLOSED");
  });

  it("resets all providers", () => {
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    breaker.recordFailure("openai");
    breaker.recordFailure("anthropic");
    breaker.recordFailure("anthropic");
    breaker.recordFailure("anthropic");

    breaker.reset();
    expect(breaker.getState("openai")).toBe("CLOSED");
    expect(breaker.getState("anthropic")).toBe("CLOSED");
  });

  it("getAll returns all entries", () => {
    breaker.recordFailure("openai");
    breaker.recordFailure("anthropic");

    const all = breaker.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.key)).toContain("openai");
    expect(all.map((e) => e.key)).toContain("anthropic");
  });
});
