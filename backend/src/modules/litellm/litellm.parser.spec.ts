import { LiteLLMParser } from "./litellm.parser";

describe("LiteLLMParser", () => {
  let parser: LiteLLMParser;

  beforeEach(() => {
    parser = new LiteLLMParser();
  });

  describe("parseModelList", () => {
    it("should parse a model list response into providers + models", () => {
      const response = {
        data: [
          {
            id: "gpt-4o",
            object: "model" as const,
            created: 1700000000,
            owned_by: "openai",
            litellm_params: { model: "openai/gpt-4o", api_key: "***" },
            model_info: {
              litellm_provider: "openai",
              context_window: 128000,
              max_output_tokens: 16384,
              input_cost_per_token: 0.000005,
              output_cost_per_token: 0.000015,
              supports_function_calling: true,
              supports_vision: true,
            },
          },
          {
            id: "claude-3-5-sonnet",
            object: "model" as const,
            created: 1700000000,
            owned_by: "anthropic",
            litellm_params: { model: "anthropic/claude-3-5-sonnet" },
            model_info: {
              litellm_provider: "anthropic",
              context_window: 200000,
              supports_function_calling: true,
            },
          },
        ],
        object: "list" as const,
      };

      const { providers, models } = parser.parseModelList(response);

      expect(providers).toHaveLength(2);
      expect(providers[0].name).toBe("OpenAI");
      expect(providers[0].slug).toBe("openai");
      expect(providers[0].type).toBe("OPENAI");
      expect(providers[1].name).toBe("Anthropic");
      expect(providers[1].type).toBe("ANTHROPIC");

      expect(models).toHaveLength(2);
      expect(models[0].modelName).toBe("gpt-4o");
      expect(models[0].contextWindow).toBe(128000);
      expect(models[0].inputPricePer1k).toBeCloseTo(0.005, 5);
      expect(models[0].outputPricePer1k).toBeCloseTo(0.015, 5);
      expect(models[0].capabilities).toContain("function-calling");
      expect(models[0].capabilities).toContain("vision");

      expect(models[1].modelName).toBe("claude-3-5-sonnet");
      expect(models[1].contextWindow).toBe(200000);
    });

    it("should handle empty model list", () => {
      const { providers, models } = parser.parseModelList({ data: [], object: "list" });
      expect(providers).toHaveLength(0);
      expect(models).toHaveLength(0);
    });

    it("should group models by provider", () => {
      const response = {
        data: [
          { id: "gpt-4o", object: "model" as const, created: 0, owned_by: "openai", model_info: { litellm_provider: "openai" } },
          { id: "gpt-3.5-turbo", object: "model" as const, created: 0, owned_by: "openai", model_info: { litellm_provider: "openai" } },
        ],
        object: "list" as const,
      };

      const { providers, models } = parser.parseModelList(response);
      expect(providers).toHaveLength(1); // One provider, two models
      expect(models).toHaveLength(2);
    });
  });

  describe("parseChatCompletion", () => {
    it("should extract content + usage", () => {
      const response = {
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1700000000,
        model: "gpt-4o",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Hello!" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      const parsed = parser.parseChatCompletion(response);
      expect(parsed.content).toBe("Hello!");
      expect(parsed.usage.totalTokens).toBe(15);
      expect(parsed.usage.promptTokens).toBe(10);
      expect(parsed.usage.completionTokens).toBe(5);
      expect(parsed.model).toBe("gpt-4o");
      expect(parsed.finishReason).toBe("stop");
    });

    it("should throw BadRequestException on empty choices", () => {
      const response = {
        id: "x",
        object: "chat.completion",
        created: 0,
        model: "gpt-4o",
        choices: [],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
      expect(() => parser.parseChatCompletion(response)).toThrow();
    });
  });

  describe("parseStreamChunk", () => {
    it("should extract delta content", () => {
      const chunk = {
        id: "x",
        object: "chat.completion.chunk",
        created: 0,
        model: "gpt-4o",
        choices: [{ index: 0, delta: { content: "Hello" }, finish_reason: null }],
      };
      expect(parser.parseStreamChunk(chunk)).toBe("Hello");
    });

    it("should return empty string for chunks without content", () => {
      const chunk = {
        id: "x",
        object: "chat.completion.chunk",
        created: 0,
        model: "gpt-4o",
        choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
      };
      expect(parser.parseStreamChunk(chunk)).toBe("");
    });
  });

  describe("parseHealthResponse", () => {
    it("should parse healthy + unhealthy endpoints", () => {
      const response = {
        healthy_endpoints: [
          { model: "gpt-4o", api_base: "https://api.openai.com" },
        ],
        unhealthy_endpoints: [
          { model: "claude-3", api_base: "https://api.anthropic.com", error: "timeout" },
        ],
      };

      const parsed = parser.parseHealthResponse(response);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].status).toBe("HEALTHY");
      expect(parsed[1].status).toBe("DOWN");
      expect(parsed[1].error).toBe("timeout");
    });
  });
});
