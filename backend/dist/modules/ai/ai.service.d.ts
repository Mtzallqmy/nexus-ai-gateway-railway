import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { LiteLLMRouter } from "../litellm/litellm.router";
import type { LiteLLMClient } from "../litellm/litellm.client";
import type { ChatCompletionDto, EmbeddingsDto, ImageGenerationDto, TextToSpeechDto, ModerationDto } from "./dto/ai.dto";
export declare class AiService {
    private readonly router;
    private readonly client;
    private readonly prisma;
    private readonly logger;
    constructor(router: LiteLLMRouter, client: LiteLLMClient, prisma: PrismaService);
    chatCompletion(dto: ChatCompletionDto, userId?: string, apiKeyId?: string): Promise<{
        id: string;
        object: string;
        created: number;
        model: string;
        choices: {
            index: number;
            message: {
                role: string;
                content: string;
            };
            finish_reason: string | null;
        }[];
        usage: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
        };
        system_fingerprint: string | undefined;
        _metadata: {
            requestId: `${string}-${string}-${string}-${string}-${string}`;
            latencyMs: number;
            cost: number;
            provider: string;
        };
    }>;
    chatCompletionStream(dto: ChatCompletionDto, userId?: string, apiKeyId?: string): AsyncGenerator<string>;
    embeddings(dto: EmbeddingsDto, userId?: string, apiKeyId?: string): Promise<unknown>;
    generateImages(dto: ImageGenerationDto, userId?: string, apiKeyId?: string): Promise<{
        _metadata: {
            requestId: `${string}-${string}-${string}-${string}-${string}`;
            latencyMs: number;
        };
    }>;
    textToSpeech(dto: TextToSpeechDto, userId?: string, apiKeyId?: string): Promise<Buffer>;
    moderation(dto: ModerationDto, userId?: string, apiKeyId?: string): Promise<unknown>;
    listModels(): Promise<{
        object: string;
        data: import("../litellm/litellm.types").LiteLLMModel[];
    }>;
    private estimateCost;
    private recordLog;
}
