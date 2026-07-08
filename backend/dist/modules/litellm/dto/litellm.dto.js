"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncHistoryQuerySchema = exports.listModelsQuerySchema = exports.syncSchema = exports.embeddingsSchema = exports.chatCompletionSchema = void 0;
const zod_1 = require("zod");
exports.chatCompletionSchema = zod_1.z.object({
    model: zod_1.z.string().min(1, "Model is required"),
    messages: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(["system", "user", "assistant", "tool"]),
        content: zod_1.z.string().min(1),
    }))
        .min(1, "At least one message is required"),
    temperature: zod_1.z.number().min(0).max(2).optional(),
    max_tokens: zod_1.z.number().int().positive().max(8192).optional(),
    top_p: zod_1.z.number().min(0).max(1).optional(),
    stream: zod_1.z.boolean().optional().default(false),
    stop: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    presence_penalty: zod_1.z.number().min(-2).max(2).optional(),
    frequency_penalty: zod_1.z.number().min(-2).max(2).optional(),
    user: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.embeddingsSchema = zod_1.z.object({
    model: zod_1.z.string().min(1),
    input: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
    encoding_format: zod_1.z.enum(["float", "base64"]).optional(),
    dimensions: zod_1.z.number().int().positive().optional(),
});
exports.syncSchema = zod_1.z.object({
    entityType: zod_1.z.enum(["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]).default("ALL"),
    force: zod_1.z.boolean().optional().default(false),
});
exports.listModelsQuerySchema = zod_1.z.object({
    providerId: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    active: zod_1.z.boolean().optional(),
});
exports.syncHistoryQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    entityType: zod_1.z.enum(["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]).optional(),
    status: zod_1.z.enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "PARTIAL"]).optional(),
});
//# sourceMappingURL=litellm.dto.js.map