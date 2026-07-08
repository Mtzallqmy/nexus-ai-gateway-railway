"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCollectionSchema = exports.createCollectionSchema = exports.listSavedPromptsQuerySchema = exports.updateSavedPromptSchema = exports.createSavedPromptSchema = exports.listConversationsQuerySchema = exports.sendMessageSchema = exports.addMessageSchema = exports.updateConversationSchema = exports.createConversationSchema = void 0;
const zod_1 = require("zod");
exports.createConversationSchema = zod_1.z.object({
    title: zod_1.z.string().default("New Conversation"),
    type: zod_1.z.enum(["CHAT", "COMPLETION", "RESPONSES", "EMBEDDINGS", "IMAGES", "VISION", "SPEECH_TO_TEXT", "TEXT_TO_SPEECH", "AUDIO_TRANSLATION", "MODERATION"]).default("CHAT"),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    systemPrompt: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.unknown()).default({}),
});
exports.updateConversationSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    systemPrompt: zod_1.z.string().optional(),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.unknown()).optional(),
    isPinned: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
});
exports.addMessageSchema = zod_1.z.object({
    role: zod_1.z.enum(["system", "user", "assistant", "tool"]),
    content: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.sendMessageSchema = zod_1.z.object({
    message: zod_1.z.string().min(1),
    stream: zod_1.z.boolean().optional().default(false),
    parameters: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.listConversationsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    type: zod_1.z.string().optional(),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    isPinned: zod_1.z.boolean().optional(),
    isArchived: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(["createdAt", "updatedAt", "title", "lastMessageAt"]).default("updatedAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.createSavedPromptSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    content: zod_1.z.string().min(1),
    systemPrompt: zod_1.z.string().optional(),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.unknown()).default({}),
    isFavorite: zod_1.z.boolean().default(false),
    isPublic: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    collectionId: zod_1.z.string().uuid().optional(),
});
exports.updateSavedPromptSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    systemPrompt: zod_1.z.string().optional(),
    providerName: zod_1.z.string().optional(),
    modelName: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.unknown()).optional(),
    isFavorite: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    collectionId: zod_1.z.string().uuid().nullable().optional(),
});
exports.listSavedPromptsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    search: zod_1.z.string().optional(),
    isFavorite: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    collectionId: zod_1.z.string().uuid().optional(),
    tags: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(["createdAt", "updatedAt", "useCount", "title"]).default("updatedAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
exports.createCollectionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(2000).optional(),
    isPublic: zod_1.z.boolean().default(false),
    color: zod_1.z.string().optional(),
});
exports.updateCollectionSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    isPublic: zod_1.z.boolean().optional(),
    color: zod_1.z.string().optional(),
});
//# sourceMappingURL=playground.dto.js.map