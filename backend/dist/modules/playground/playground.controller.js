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
exports.PlaygroundController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const playground_service_1 = require("./playground.service");
const playground_dto_1 = require("./dto/playground.dto");
const playground_dto_2 = require("./dto/playground.dto");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PlaygroundController = class PlaygroundController {
    playground;
    constructor(playground) {
        this.playground = playground;
    }
    async createConversation(dto, user) {
        return this.playground.createConversation(dto, user.id);
    }
    async listConversations(query, user) {
        return this.playground.findAllConversations(query, user.id);
    }
    async getConversation(id, user) {
        return this.playground.findOneConversation(id, user.id);
    }
    async updateConversation(id, dto, user) {
        return this.playground.updateConversation(id, dto, user.id);
    }
    async deleteConversation(id, user) {
        return this.playground.deleteConversation(id, user.id);
    }
    async pinConversation(id, pinned, user) {
        return this.playground.pinConversation(id, pinned, user.id);
    }
    async exportConversation(id, format, user) {
        return this.playground.exportConversation(id, user.id, format ?? "json");
    }
    async addMessage(id, dto, user) {
        return this.playground.addMessage(id, dto, user.id);
    }
    async sendMessage(id, dto, user) {
        return this.playground.sendMessage(id, dto, user);
    }
    async createPrompt(dto, user) {
        return this.playground.createSavedPrompt(dto, user.id);
    }
    async listPrompts(query, user) {
        return this.playground.findAllSavedPrompts(query, user.id);
    }
    async getPrompt(id, user) {
        return this.playground.findOneSavedPrompt(id, user.id);
    }
    async updatePrompt(id, dto, user) {
        return this.playground.updateSavedPrompt(id, dto, user.id);
    }
    async deletePrompt(id, user) {
        return this.playground.deleteSavedPrompt(id, user.id);
    }
    async usePrompt(id, user) {
        return this.playground.useSavedPrompt(id, user.id);
    }
    async createCollection(dto, user) {
        return this.playground.createCollection(dto, user.id);
    }
    async listCollections(user) {
        return this.playground.findAllCollections(user.id);
    }
    async updateCollection(id, dto, user) {
        return this.playground.updateCollection(id, dto, user.id);
    }
    async deleteCollection(id, user) {
        return this.playground.deleteCollection(id, user.id);
    }
    async generateCodeSamples(body) {
        return this.playground.generateCodeSamples(body);
    }
};
exports.PlaygroundController = PlaygroundController;
__decorate([
    (0, common_1.Post)("conversations"),
    (0, swagger_1.ApiOperation)({ summary: "Create a new playground conversation" }),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.createConversationSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)("conversations"),
    (0, swagger_1.ApiOperation)({ summary: "List conversations (paginated, filterable, searchable)" }),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.listConversationsQuerySchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Get)("conversations/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Patch)("conversations/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.updateConversationSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Delete)("conversations/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)("conversations/:id/pin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)("pinned")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "pinConversation", null);
__decorate([
    (0, common_1.Get)("conversations/:id/export"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Query)("format")),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "exportConversation", null);
__decorate([
    (0, common_1.Post)("conversations/:id/messages"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_2.addMessageSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "addMessage", null);
__decorate([
    (0, common_1.Post)("conversations/:id/send"),
    (0, swagger_1.ApiOperation)({ summary: "Send a message and get AI response (routes through LiteLLM)" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.sendMessageSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)("prompts"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.createSavedPromptSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "createPrompt", null);
__decorate([
    (0, common_1.Get)("prompts"),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.listSavedPromptsQuerySchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "listPrompts", null);
__decorate([
    (0, common_1.Get)("prompts/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "getPrompt", null);
__decorate([
    (0, common_1.Patch)("prompts/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.updateSavedPromptSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "updatePrompt", null);
__decorate([
    (0, common_1.Delete)("prompts/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "deletePrompt", null);
__decorate([
    (0, common_1.Post)("prompts/:id/use"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "usePrompt", null);
__decorate([
    (0, common_1.Post)("collections"),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.createCollectionSchema))),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "createCollection", null);
__decorate([
    (0, common_1.Get)("collections"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "listCollections", null);
__decorate([
    (0, common_1.Patch)("collections/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(playground_dto_1.updateCollectionSchema))),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "updateCollection", null);
__decorate([
    (0, common_1.Delete)("collections/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "deleteCollection", null);
__decorate([
    (0, common_1.Post)("code-samples"),
    (0, swagger_1.ApiOperation)({ summary: "Generate code samples in 9 languages (cURL, JS, TS, Python, Go, Java, C#, PHP, Rust)" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "generateCodeSamples", null);
exports.PlaygroundController = PlaygroundController = __decorate([
    (0, swagger_1.ApiTags)("Playground"),
    (0, common_1.Controller)("playground"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [playground_service_1.PlaygroundService])
], PlaygroundController);
//# sourceMappingURL=playground.controller.js.map