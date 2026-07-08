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
exports.LiteLLMRouter = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
const crypto_1 = require("crypto");
let LiteLLMRouter = class LiteLLMRouter {
    client;
    repo;
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.ROUTER);
    constructor(client, repo) {
        this.client = client;
        this.repo = repo;
    }
    async routeChatCompletion(req) {
        this.logger.log(`Routing chat completion → model=${req.model} stream=false`);
        const startedAt = Date.now();
        try {
            const response = await this.client.chatCompletion(req);
            const duration = Date.now() - startedAt;
            await this.recordUsage(req.model, response.usage?.total_tokens ?? 0, response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0, false).catch((e) => this.logger.warn(`Usage recording failed: ${e.message}`));
            this.logger.debug?.(`Chat completion completed in ${duration}ms (tokens=${response.usage?.total_tokens})`);
            return response;
        }
        catch (err) {
            await this.recordUsage(req.model, 0, 0, 0, true).catch(() => void 0);
            throw err;
        }
    }
    async *routeChatCompletionStream(req) {
        this.logger.log(`Routing chat completion → model=${req.model} stream=true`);
        let chunkCount = 0;
        try {
            for await (const chunk of this.client.chatCompletionStream(req)) {
                chunkCount++;
                yield chunk;
            }
            this.logger.debug?.(`Stream completed (${chunkCount} chunks)`);
        }
        catch (err) {
            this.logger.error(`Stream failed after ${chunkCount} chunks: ${err.message}`);
            throw err;
        }
    }
    async routeEmbeddings(model, input) {
        this.logger.log(`Routing embeddings → model=${model} items=${Array.isArray(input) ? input.length : 1}`);
        const result = await this.client.embeddings(model, input);
        await this.recordUsage(model, 0, 0, 0, false).catch(() => void 0);
        return result;
    }
    async recordUsage(modelName, totalTokens, inputTokens, outputTokens, isError) {
        await this.repo.incrementUsage({
            counterId: (0, crypto_1.randomUUID)(),
            modelName,
            requestCount: 1,
            tokenCount: totalTokens,
            inputTokens,
            outputTokens,
            errorCount: isError ? 1 : 0,
        });
    }
};
exports.LiteLLMRouter = LiteLLMRouter;
exports.LiteLLMRouter = LiteLLMRouter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Function])
], LiteLLMRouter);
//# sourceMappingURL=litellm.router.js.map