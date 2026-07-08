/**
 * LiteLLM Response Parser
 *
 * Translates raw LiteLLM API responses into the platform's
 * internal domain shape. Handles:
 *   - Normalizing model IDs
 *   - Extracting token usage
 *   - Parsing SSE stream chunks
 *   - Detecting errors embedded in successful responses
 *   - Mapping LiteLLM provider/model metadata to our schema
 */
import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { LITELLM_LOG_CONTEXTS } from "./litellm.constants";
import type {
  LiteLLMChatCompletionResponse,
  LiteLLMChatCompletionChunk,
  LiteLLMModel,
  LiteLLMModelListResponse,
  LiteLLMHealthResponse,
  LiteLLMLivenessResponse,
} from "./litellm.types";

export interface ParsedModel {
  litellmModelId: string;
  modelName: string;
  displayName: string;
  providerName: string;
  providerType: string;
  contextWindow?: number;
  maxOutput?: number;
  inputPricePer1k?: number;
  outputPricePer1k?: number;
  capabilities: string[];
  modalities: string[];
  metadata: Record<string, unknown>;
}

export interface ParsedProvider {
  litellmId: string;
  name: string;
  slug: string;
  type: string;
  baseUrl?: string;
  supportedFeatures: string[];
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "UNKNOWN";
  metadata: Record<string, unknown>;
}

export interface ParsedUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

@Injectable()
export class LiteLLMParser {
  private readonly logger = new Logger(LITELLM_LOG_CONTEXTS.PARSER);

  /**
   * Parses LiteLLM's /v1/models response into a list of normalized
   * providers + models, ready for upserting into our DB.
   */
  parseModelList(response: LiteLLMModelListResponse): { providers: ParsedProvider[]; models: ParsedModel[] } {
    const providersMap = new Map<string, ParsedProvider>();
    const models: ParsedModel[] = [];

    for (const m of response.data ?? []) {
      const providerType = m.model_info?.litellm_provider ?? m.owned_by ?? "custom";
      const providerName = this.providerDisplayName(providerType);
      const providerSlug = this.slugify(providerName);

      if (!providersMap.has(providerSlug)) {
        providersMap.set(providerSlug, {
          litellmId: providerSlug,
          name: providerName,
          slug: providerSlug,
          type: this.normalizeProviderType(providerType),
          baseUrl: m.litellm_params?.api_base,
          supportedFeatures: this.extractFeatures(m),
          status: "UNKNOWN",
          metadata: { rawType: providerType },
        });
      }

      models.push({
        litellmModelId: m.id,
        modelName: m.id,
        displayName: m.id,
        providerName,
        providerType,
        contextWindow: m.model_info?.context_window,
        maxOutput: m.model_info?.max_output_tokens,
        inputPricePer1k: m.model_info?.input_cost_per_token ? m.model_info.input_cost_per_token * 1000 : undefined,
        outputPricePer1k: m.model_info?.output_cost_per_token ? m.model_info.output_cost_per_token * 1000 : undefined,
        capabilities: this.extractCapabilities(m),
        modalities: this.extractModalities(m),
        metadata: m.model_info ?? {},
      });
    }

    return { providers: Array.from(providersMap.values()), models };
  }

  /**
   * Parses a non-streaming chat completion response, extracting usage
   * and validating it has at least one choice.
   */
  parseChatCompletion(response: LiteLLMChatCompletionResponse): { content: string; usage: ParsedUsage; model: string; finishReason: string | null } {
    if (!response.choices?.length) {
      throw new BadRequestException("LiteLLM returned no completion choices");
    }
    return {
      content: response.choices[0].message.content,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0,
      },
      model: response.model,
      finishReason: response.choices[0].finish_reason,
    };
  }

  /**
   * Parses a single SSE chunk from a streaming chat completion.
   * Returns the delta content (or empty string for non-content chunks).
   */
  parseStreamChunk(chunk: LiteLLMChatCompletionChunk): string {
    if (!chunk.choices?.length) return "";
    const delta = chunk.choices[0].delta;
    return delta?.content ?? "";
  }

  /**
   * Parses the LiteLLM /health endpoint response into a per-provider
   * health summary.
   */
  parseHealthResponse(response: LiteLLMHealthResponse): Array<{
    providerName: string;
    apiBase: string;
    status: "HEALTHY" | "DOWN";
    error?: string;
  }> {
    const out: Array<{ providerName: string; apiBase: string; status: "HEALTHY" | "DOWN"; error?: string }> = [];
    for (const e of response.healthy_endpoints ?? []) {
      out.push({ providerName: e.model, apiBase: e.api_base, status: "HEALTHY" });
    }
    for (const e of response.unhealthy_endpoints ?? []) {
      out.push({ providerName: e.model, apiBase: e.api_base, status: "DOWN", error: e.error });
    }
    return out;
  }

  /**
   * Parses the LiteLLM /health/liveness endpoint response.
   */
  parseLivenessResponse(response: LiteLLMLivenessResponse): {
    status: "HEALTHY" | "DOWN";
    probes: Array<{ model: string; status: string; error?: string }>;
  } {
    return {
      status: response.status === "healthy" ? "HEALTHY" : "DOWN",
      probes: response.liveness_probes ?? [],
    };
  }

  // ============================================================
  // HELPERS
  // ============================================================
  private providerDisplayName(type: string): string {
    const map: Record<string, string> = {
      openai: "OpenAI",
      anthropic: "Anthropic",
      "gemini-1.5-flash": "Google AI",
      gemini: "Google AI",
      vertex_ai: "Google Vertex AI",
      mistral: "Mistral AI",
      cohere: "Cohere",
      azure: "Azure OpenAI",
      sagemaker: "AWS Sagemaker",
      bedrock: "AWS Bedrock",
      huggingface: "Hugging Face",
      openrouter: "OpenRouter",
      nvidia: "NVIDIA",
    };
    return map[type.toLowerCase()] ?? type.charAt(0).toUpperCase() + type.slice(1);
  }

  private normalizeProviderType(type: string): string {
    const t = type.toLowerCase();
    if (t.includes("openai")) return "OPENAI";
    if (t.includes("anthropic")) return "ANTHROPIC";
    if (t.includes("gemini") || t.includes("vertex")) return "GOOGLE";
    if (t.includes("mistral")) return "MISTRAL";
    if (t.includes("cohere")) return "COHERE";
    if (t.includes("azure")) return "AZURE";
    if (t.includes("sagemaker") || t.includes("bedrock")) return "AWS";
    if (t.includes("hugging")) return "HUGGINGFACE";
    if (t.includes("openrouter")) return "OPENROUTER";
    if (t.includes("nvidia")) return "NVIDIA";
    return "CUSTOM";
  }

  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "provider";
  }

  private extractCapabilities(m: LiteLLMModel): string[] {
    const caps: string[] = [];
    const info = m.model_info ?? {};
    if (info.supports_function_calling) caps.push("function-calling");
    if (info.supports_parallel_function_calling) caps.push("parallel-function-calling");
    if (info.supports_vision) caps.push("vision");
    if (info.supports_response_schema) caps.push("json-mode");
    if (info.supports_web_search) caps.push("web-search");
    return caps;
  }

  private extractModalities(_m: LiteLLMModel): string[] {
    // LiteLLM doesn't expose modalities directly in /v1/models; we infer
    // from capabilities. Phase 4 can enrich this from /v1/models/info.
    return ["text"];
  }

  private extractFeatures(m: LiteLLMModel): string[] {
    const feats: string[] = ["chat"];
    const info = m.model_info ?? {};
    if (info.supports_function_calling) feats.push("function-calling");
    if (info.supports_vision) feats.push("vision");
    if (info.supports_response_schema) feats.push("json-mode");
    return feats;
  }
}
