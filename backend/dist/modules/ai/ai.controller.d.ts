import { Response } from "express";
import { AiService } from "./ai.service";
import { type ChatCompletionDto, type EmbeddingsDto, type ImageGenerationDto, type ModerationDto, type TextToSpeechDto } from "./dto/ai.dto";
import type { AuthenticatedUser } from "../../common/decorators/current-user.decorator";
export declare class AiController {
    private readonly ai;
    constructor(ai: AiService);
    chatCompletions(dto: ChatCompletionDto, user: AuthenticatedUser, res: Response): Promise<{
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
    } | undefined>;
    completions(body: unknown, user: AuthenticatedUser): Promise<{
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
    embeddings(dto: EmbeddingsDto, user: AuthenticatedUser): Promise<unknown>;
    imageGenerations(dto: ImageGenerationDto, user: AuthenticatedUser): Promise<{
        _metadata: {
            requestId: `${string}-${string}-${string}-${string}-${string}`;
            latencyMs: number;
        };
    }>;
    textToSpeech(dto: TextToSpeechDto, user: AuthenticatedUser, res: Response): Promise<Response<any, Record<string, any>>>;
    moderations(dto: ModerationDto, user: AuthenticatedUser): Promise<unknown>;
    listModels(): Promise<{
        object: string;
        data: import("../litellm/litellm.types").LiteLLMModel[];
    }>;
    getModel(): Promise<{
        object: string;
        owned_by: string;
    }>;
}
