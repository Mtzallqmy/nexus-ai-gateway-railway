import type { ILiteLLMRouter } from "./litellm.interfaces";
import type { LiteLLMChatCompletionRequest, LiteLLMChatCompletionResponse, LiteLLMChatCompletionChunk } from "./litellm.types";
import type { LiteLLMClient } from "./litellm.client";
import type { LiteLLMRepository } from "./litellm.repository";
export declare class LiteLLMRouter implements ILiteLLMRouter {
    private readonly client;
    private readonly repo;
    private readonly logger;
    constructor(client: LiteLLMClient, repo: LiteLLMRepository);
    routeChatCompletion(req: LiteLLMChatCompletionRequest): Promise<LiteLLMChatCompletionResponse>;
    routeChatCompletionStream(req: LiteLLMChatCompletionRequest): AsyncIterable<LiteLLMChatCompletionChunk>;
    routeEmbeddings(model: string, input: string | string[]): Promise<unknown>;
    private recordUsage;
}
