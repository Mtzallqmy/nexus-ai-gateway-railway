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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const ai_dto_1 = require("./dto/ai.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AiController = class AiController {
    ai;
    constructor(ai) {
        this.ai = ai;
    }
    async chatCompletions(dto, user, res) {
        if (dto.stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");
            res.setHeader("X-Accel-Buffering", "no");
            res.flushHeaders();
            try {
                for await (const chunk of this.ai.chatCompletionStream(dto, user?.id)) {
                    res.write(chunk);
                }
            }
            catch (err) {
                res.write(`data: ${JSON.stringify({ error: { message: err.message } })}\n\n`);
                res.write("data: [DONE]\n\n");
            }
            finally {
                res.end();
            }
            return;
        }
        const result = await this.ai.chatCompletion(dto, user?.id);
        return result;
    }
    async completions(body, user) {
        const { model, prompt, ...params } = body;
        return this.ai.chatCompletion({
            model,
            messages: [{ role: "user", content: prompt }],
            ...params,
        }, user?.id);
    }
    async embeddings(dto, user) {
        return this.ai.embeddings(dto, user?.id);
    }
    async imageGenerations(dto, user) {
        return this.ai.generateImages(dto, user?.id);
    }
    async textToSpeech(dto, user, res) {
        const audioBuffer = await this.ai.textToSpeech(dto, user?.id);
        res.setHeader("Content-Type", `audio/${dto.response_format}`);
        res.setHeader("Content-Disposition", `attachment; filename="speech.${dto.response_format}"`);
        return res.send(audioBuffer);
    }
    async moderations(dto, user) {
        return this.ai.moderation(dto, user?.id);
    }
    async listModels() {
        return this.ai.listModels();
    }
    async getModel() {
        return { object: "model", owned_by: "system" };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)("chat/completions"),
    (0, swagger_1.ApiOperation)({ summary: "Create a chat completion (OpenAI-compatible, supports streaming)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ai_dto_1.chatCompletionSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "chatCompletions", null);
__decorate([
    (0, common_1.Post)("completions"),
    (0, swagger_1.ApiOperation)({ summary: "Create a legacy text completion (OpenAI-compatible)" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "completions", null);
__decorate([
    (0, common_1.Post)("embeddings"),
    (0, swagger_1.ApiOperation)({ summary: "Create embeddings (OpenAI-compatible)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ai_dto_1.embeddingsSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "embeddings", null);
__decorate([
    (0, common_1.Post)("images/generations"),
    (0, swagger_1.ApiOperation)({ summary: "Generate images (OpenAI-compatible)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ai_dto_1.imageGenerationSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "imageGenerations", null);
__decorate([
    (0, common_1.Post)("audio/speech"),
    (0, swagger_1.ApiOperation)({ summary: "Generate speech from text (OpenAI-compatible TTS)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ai_dto_1.textToSpeechSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "textToSpeech", null);
__decorate([
    (0, common_1.Post)("moderations"),
    (0, swagger_1.ApiOperation)({ summary: "Moderate content (OpenAI-compatible)" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(ai_dto_1.moderationSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "moderations", null);
__decorate([
    (0, common_1.Get)("models"),
    (0, swagger_1.ApiOperation)({ summary: "List all available models (OpenAI-compatible)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "listModels", null);
__decorate([
    (0, common_1.Get)("models/:id"),
    (0, swagger_1.ApiOperation)({ summary: "Get a specific model (OpenAI-compatible)" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getModel", null);
exports.AiController = AiController = __decorate([
    (0, swagger_1.ApiTags)("AI API"),
    (0, common_1.Controller)("v1"),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map