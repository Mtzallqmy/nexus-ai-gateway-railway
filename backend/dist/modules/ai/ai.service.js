"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const crypto_1 = require("crypto");
let AiService = class AiService {
    router;
    client;
    prisma;
    logger = new common_1.Logger("AiService");
    constructor(router, client, prisma) {
        this.router = router;
        this.client = client;
        this.prisma = prisma;
        this.logger.log("Unified AI service initialized");
    }
    async chatCompletion(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[chat] model=${dto.model} stream=${dto.stream} user=${userId ?? "api"}`);
        try {
            const response = await this.router.routeChatCompletion({
                model: dto.model,
                messages: dto.messages.map((m) => ({
                    role: m.role,
                    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
                })),
                temperature: dto.temperature,
                max_tokens: dto.max_tokens ?? dto.max_completion_tokens,
                top_p: dto.top_p,
                stream: false,
                stop: dto.stop,
                presence_penalty: dto.presence_penalty,
                frequency_penalty: dto.frequency_penalty,
                user: dto.user,
                metadata: dto.metadata,
            });
            const latencyMs = Date.now() - startedAt;
            const tokens = response.usage?.total_tokens ?? 0;
            const cost = this.estimateCost(dto.model, response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0);
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/chat/completions",
                method: "POST",
                requestStatus: 200,
                durationMs: latencyMs,
                tokenCount: tokens,
                inputTokens: response.usage?.prompt_tokens ?? 0,
                outputTokens: response.usage?.completion_tokens ?? 0,
                cost,
                requestId,
                userId,
                apiKeyId,
                isStreaming: false,
            }).catch(() => void 0);
            return {
                id: response.id ?? `chatcmpl-${requestId}`,
                object: "chat.completion",
                created: response.created ?? Math.floor(Date.now() / 1000),
                model: dto.model,
                choices: response.choices ?? [],
                usage: response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
                system_fingerprint: response.system_fingerprint,
                _metadata: {
                    requestId,
                    latencyMs,
                    cost: Number(cost),
                    provider: dto.model.split("/")[0] ?? "unknown",
                },
            };
        }
        catch (err) {
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/chat/completions",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
                isStreaming: false,
            }).catch(() => void 0);
            throw err;
        }
    }
    async *chatCompletionStream(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[chat-stream] model=${dto.model} user=${userId ?? "api"}`);
        yield `: heartbeat\n\n`;
        try {
            for await (const chunk of this.router.routeChatCompletionStream({
                model: dto.model,
                messages: dto.messages.map((m) => ({
                    role: m.role,
                    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
                })),
                temperature: dto.temperature,
                max_tokens: dto.max_tokens ?? dto.max_completion_tokens,
                top_p: dto.top_p,
                stream: true,
                stop: dto.stop,
                presence_penalty: dto.presence_penalty,
                frequency_penalty: dto.frequency_penalty,
                user: dto.user,
            })) {
                const sseChunk = {
                    id: chunk.id ?? `chatcmpl-${requestId}`,
                    object: "chat.completion.chunk",
                    created: chunk.created ?? Math.floor(Date.now() / 1000),
                    model: dto.model,
                    choices: chunk.choices ?? [],
                };
                yield `data: ${JSON.stringify(sseChunk)}\n\n`;
            }
            yield `data: [DONE]\n\n`;
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/chat/completions",
                method: "POST",
                requestStatus: 200,
                durationMs: Date.now() - startedAt,
                requestId,
                userId,
                apiKeyId,
                isStreaming: true,
            }).catch(() => void 0);
        }
        catch (err) {
            const errorChunk = {
                error: {
                    message: err.message,
                    type: "internal_error",
                    code: "stream_error",
                },
            };
            yield `data: ${JSON.stringify(errorChunk)}\n\n`;
            yield `data: [DONE]\n\n`;
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/chat/completions",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
                isStreaming: true,
            }).catch(() => void 0);
        }
    }
    async embeddings(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[embeddings] model=${dto.model} user=${userId ?? "api"}`);
        try {
            const result = await this.router.routeEmbeddings(dto.model, dto.input);
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/embeddings",
                method: "POST",
                requestStatus: 200,
                durationMs: Date.now() - startedAt,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            return result;
        }
        catch (err) {
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/embeddings",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            throw err;
        }
    }
    async generateImages(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[images] model=${dto.model} prompt="${dto.prompt.slice(0, 50)}..." user=${userId ?? "api"}`);
        try {
            const result = await this.client.generateImages(dto.model, dto.prompt, dto.n, dto.size);
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/images/generations",
                method: "POST",
                requestStatus: 200,
                durationMs: Date.now() - startedAt,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            return {
                ...result,
                _metadata: { requestId, latencyMs: Date.now() - startedAt },
            };
        }
        catch (err) {
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/images/generations",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            throw err;
        }
    }
    async textToSpeech(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[tts] model=${dto.model} voice=${dto.voice} user=${userId ?? "api"}`);
        try {
            const arrayBuffer = await this.client.textToSpeech(dto.model, dto.input, dto.voice);
            const audioBuffer = Buffer.from(arrayBuffer);
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/audio/speech",
                method: "POST",
                requestStatus: 200,
                durationMs: Date.now() - startedAt,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            return audioBuffer;
        }
        catch (err) {
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/audio/speech",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            throw err;
        }
    }
    async moderation(dto, userId, apiKeyId) {
        const startedAt = Date.now();
        const requestId = (0, crypto_1.randomUUID)();
        this.logger.log(`[moderation] model=${dto.model} user=${userId ?? "api"}`);
        try {
            const result = await this.client.moderate(dto.model, dto.input);
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/moderations",
                method: "POST",
                requestStatus: 200,
                durationMs: Date.now() - startedAt,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            return result;
        }
        catch (err) {
            await this.recordLog({
                providerName: dto.model.split("/")[0] ?? "unknown",
                modelName: dto.model,
                endpoint: "/v1/moderations",
                method: "POST",
                requestStatus: 500,
                durationMs: Date.now() - startedAt,
                errorMessage: err.message,
                requestId,
                userId,
                apiKeyId,
            }).catch(() => void 0);
            throw err;
        }
    }
    async listModels() {
        const response = await this.client.getModels();
        return {
            object: "list",
            data: response.data ?? [],
        };
    }
    estimateCost(model, inputTokens, outputTokens) {
        const costPer1k = {
            "gpt-4o": { input: 0.005, output: 0.015 },
            "gpt-4-turbo": { input: 0.01, output: 0.03 },
            "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
            "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
            "claude-3-opus": { input: 0.015, output: 0.075 },
            "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
            "gemini-1.5-flash": { input: 0.00035, output: 0.00105 },
        };
        const pricing = costPer1k[model] ?? { input: 0.001, output: 0.002 };
        const cost = (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
        return new client_1.Prisma.Decimal(cost.toFixed(6));
    }
    async recordLog(data) {
        await this.prisma.providerLog.create({
            data: {
                providerName: data.providerName,
                modelName: data.modelName,
                endpoint: data.endpoint,
                method: data.method,
                requestStatus: data.requestStatus,
                durationMs: data.durationMs ?? 0,
                tokenCount: data.tokenCount ?? 0,
                inputTokens: data.inputTokens ?? 0,
                outputTokens: data.outputTokens ?? 0,
                cost: data.cost ?? new client_1.Prisma.Decimal(0),
                errorMessage: data.errorMessage,
                requestId: data.requestId,
                userId: data.userId,
                apiKeyId: data.apiKeyId,
                isStreaming: data.isStreaming ?? false,
                isCached: data.isCached ?? false,
                metadata: data.metadata ?? client_1.Prisma.JsonNull,
            },
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function, prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map