"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMParser = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMParser = class LiteLLMParser {
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.PARSER);
    parseModelList(response) {
        const providersMap = new Map();
        const models = [];
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
    parseChatCompletion(response) {
        if (!response.choices?.length) {
            throw new common_1.BadRequestException("LiteLLM returned no completion choices");
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
    parseStreamChunk(chunk) {
        if (!chunk.choices?.length)
            return "";
        const delta = chunk.choices[0].delta;
        return delta?.content ?? "";
    }
    parseHealthResponse(response) {
        const out = [];
        for (const e of response.healthy_endpoints ?? []) {
            out.push({ providerName: e.model, apiBase: e.api_base, status: "HEALTHY" });
        }
        for (const e of response.unhealthy_endpoints ?? []) {
            out.push({ providerName: e.model, apiBase: e.api_base, status: "DOWN", error: e.error });
        }
        return out;
    }
    parseLivenessResponse(response) {
        return {
            status: response.status === "healthy" ? "HEALTHY" : "DOWN",
            probes: response.liveness_probes ?? [],
        };
    }
    providerDisplayName(type) {
        const map = {
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
    normalizeProviderType(type) {
        const t = type.toLowerCase();
        if (t.includes("openai"))
            return "OPENAI";
        if (t.includes("anthropic"))
            return "ANTHROPIC";
        if (t.includes("gemini") || t.includes("vertex"))
            return "GOOGLE";
        if (t.includes("mistral"))
            return "MISTRAL";
        if (t.includes("cohere"))
            return "COHERE";
        if (t.includes("azure"))
            return "AZURE";
        if (t.includes("sagemaker") || t.includes("bedrock"))
            return "AWS";
        if (t.includes("hugging"))
            return "HUGGINGFACE";
        if (t.includes("openrouter"))
            return "OPENROUTER";
        if (t.includes("nvidia"))
            return "NVIDIA";
        return "CUSTOM";
    }
    slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "provider";
    }
    extractCapabilities(m) {
        const caps = [];
        const info = m.model_info ?? {};
        if (info.supports_function_calling)
            caps.push("function-calling");
        if (info.supports_parallel_function_calling)
            caps.push("parallel-function-calling");
        if (info.supports_vision)
            caps.push("vision");
        if (info.supports_response_schema)
            caps.push("json-mode");
        if (info.supports_web_search)
            caps.push("web-search");
        return caps;
    }
    extractModalities(_m) {
        return ["text"];
    }
    extractFeatures(m) {
        const feats = ["chat"];
        const info = m.model_info ?? {};
        if (info.supports_function_calling)
            feats.push("function-calling");
        if (info.supports_vision)
            feats.push("vision");
        if (info.supports_response_schema)
            feats.push("json-mode");
        return feats;
    }
};
exports.LiteLLMParser = LiteLLMParser;
exports.LiteLLMParser = LiteLLMParser = __decorate([
    (0, common_1.Injectable)()
], LiteLLMParser);
//# sourceMappingURL=litellm.parser.js.map