import type { LiteLLMChatCompletionResponse, LiteLLMChatCompletionChunk, LiteLLMModelListResponse, LiteLLMHealthResponse, LiteLLMLivenessResponse } from "./litellm.types";
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
export declare class LiteLLMParser {
    private readonly logger;
    parseModelList(response: LiteLLMModelListResponse): {
        providers: ParsedProvider[];
        models: ParsedModel[];
    };
    parseChatCompletion(response: LiteLLMChatCompletionResponse): {
        content: string;
        usage: ParsedUsage;
        model: string;
        finishReason: string | null;
    };
    parseStreamChunk(chunk: LiteLLMChatCompletionChunk): string;
    parseHealthResponse(response: LiteLLMHealthResponse): Array<{
        providerName: string;
        apiBase: string;
        status: "HEALTHY" | "DOWN";
        error?: string;
    }>;
    parseLivenessResponse(response: LiteLLMLivenessResponse): {
        status: "HEALTHY" | "DOWN";
        probes: Array<{
            model: string;
            status: string;
            error?: string;
        }>;
    };
    private providerDisplayName;
    private normalizeProviderType;
    private slugify;
    private extractCapabilities;
    private extractModalities;
    private extractFeatures;
}
