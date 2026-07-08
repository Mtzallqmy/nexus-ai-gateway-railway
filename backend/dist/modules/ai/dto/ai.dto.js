"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationSchema = exports.transcriptionSchema = exports.textToSpeechSchema = exports.imageGenerationSchema = exports.embeddingsSchema = exports.chatCompletionSchema = void 0;
const zod_1 = require("zod");
exports.chatCompletionSchema = zod_1.z.object({
    model: zod_1.z.string().min(1),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(["system", "user", "assistant", "tool"]),
        content: zod_1.z.union([
            zod_1.z.string(),
            zod_1.z.array(zod_1.z.object({
                type: zod_1.z.enum(["text", "image_url", "input_audio"]),
                text: zod_1.z.string().optional(),
                image_url: zod_1.z.object({ url: zod_1.z.string() }).optional(),
                input_audio: zod_1.z.object({ data: zod_1.z.string(), format: zod_1.z.string() }).optional(),
            })),
        ]),
        name: zod_1.z.string().optional(),
        tool_call_id: zod_1.z.string().optional(),
    })),
    temperature: zod_1.z.number().min(0).max(2).optional(),
    top_p: zod_1.z.number().min(0).max(1).optional(),
    top_k: zod_1.z.number().int().positive().optional(),
    max_tokens: zod_1.z.number().int().positive().max(32768).optional(),
    max_completion_tokens: zod_1.z.number().int().positive().optional(),
    stream: zod_1.z.boolean().optional().default(false),
    stop: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    presence_penalty: zod_1.z.number().min(-2).max(2).optional(),
    frequency_penalty: zod_1.z.number().min(-2).max(2).optional(),
    seed: zod_1.z.number().int().optional(),
    user: zod_1.z.string().optional(),
    n: zod_1.z.number().int().positive().max(128).optional(),
    logprobs: zod_1.z.boolean().optional(),
    top_logprobs: zod_1.z.number().int().positive().max(20).optional(),
    response_format: zod_1.z.object({
        type: zod_1.z.enum(["text", "json_object", "json_schema"]),
        json_schema: zod_1.z.object({ name: zod_1.z.string(), schema: zod_1.z.record(zod_1.z.unknown()) }).optional(),
    }).optional(),
    tools: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal("function"),
        function: zod_1.z.object({
            name: zod_1.z.string(),
            description: zod_1.z.string().optional(),
            parameters: zod_1.z.record(zod_1.z.unknown()),
        }),
    })).optional(),
    tool_choice: zod_1.z.union([zod_1.z.enum(["auto", "none", "required"]), zod_1.z.object({ type: zod_1.z.literal("function"), function: zod_1.z.object({ name: zod_1.z.string() }) })]).optional(),
    reasoning_effort: zod_1.z.enum(["low", "medium", "high"]).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.embeddingsSchema = zod_1.z.object({
    model: zod_1.z.string().min(1),
    input: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
    encoding_format: zod_1.z.enum(["float", "base64"]).optional().default("float"),
    dimensions: zod_1.z.number().int().positive().optional(),
    user: zod_1.z.string().optional(),
});
exports.imageGenerationSchema = zod_1.z.object({
    model: zod_1.z.string().default("dall-e-3"),
    prompt: zod_1.z.string().min(1),
    n: zod_1.z.number().int().positive().max(10).default(1),
    size: zod_1.z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
    quality: zod_1.z.enum(["standard", "hd"]).default("standard"),
    style: zod_1.z.enum(["natural", "vivid"]).default("natural"),
    response_format: zod_1.z.enum(["url", "b64_json"]).default("url"),
    user: zod_1.z.string().optional(),
});
exports.textToSpeechSchema = zod_1.z.object({
    model: zod_1.z.string().default("tts-1"),
    input: zod_1.z.string().min(1),
    voice: zod_1.z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
    response_format: zod_1.z.enum(["mp3", "opus", "aac", "flac"]).default("mp3"),
    speed: zod_1.z.number().min(0.25).max(4).default(1),
});
exports.transcriptionSchema = zod_1.z.object({
    model: zod_1.z.string().default("whisper-1"),
    file: zod_1.z.any(),
    language: zod_1.z.string().optional(),
    prompt: zod_1.z.string().optional(),
    response_format: zod_1.z.enum(["json", "text", "srt", "verbose_json", "vtt"]).default("json"),
    temperature: zod_1.z.number().min(0).max(1).default(0),
});
exports.moderationSchema = zod_1.z.object({
    model: zod_1.z.string().default("text-moderation-latest"),
    input: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]),
});
//# sourceMappingURL=ai.dto.js.map