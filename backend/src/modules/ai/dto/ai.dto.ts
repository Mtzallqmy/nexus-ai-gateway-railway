import { z } from "zod";

// ============================================================
// CHAT COMPLETIONS (OpenAI-compatible)
// ============================================================
export const chatCompletionSchema = z.object({
  model: z.string().min(1),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant", "tool"]),
      content: z.union([
        z.string(),
        z.array(
          z.object({
            type: z.enum(["text", "image_url", "input_audio"]),
            text: z.string().optional(),
            image_url: z.object({ url: z.string() }).optional(),
            input_audio: z.object({ data: z.string(), format: z.string() }).optional(),
          })
        ),
      ]),
      name: z.string().optional(),
      tool_call_id: z.string().optional(),
    })
  ),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  top_k: z.number().int().positive().optional(),
  max_tokens: z.number().int().positive().max(32768).optional(),
  max_completion_tokens: z.number().int().positive().optional(),
  stream: z.boolean().optional().default(false),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  seed: z.number().int().optional(),
  user: z.string().optional(),
  n: z.number().int().positive().max(128).optional(),
  logprobs: z.boolean().optional(),
  top_logprobs: z.number().int().positive().max(20).optional(),
  response_format: z.object({
    type: z.enum(["text", "json_object", "json_schema"]),
    json_schema: z.object({ name: z.string(), schema: z.record(z.unknown()) }).optional(),
  }).optional(),
  tools: z.array(
    z.object({
      type: z.literal("function"),
      function: z.object({
        name: z.string(),
        description: z.string().optional(),
        parameters: z.record(z.unknown()),
      }),
    })
  ).optional(),
  tool_choice: z.union([z.enum(["auto", "none", "required"]), z.object({ type: z.literal("function"), function: z.object({ name: z.string() }) })]).optional(),
  reasoning_effort: z.enum(["low", "medium", "high"]).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ChatCompletionDto = z.infer<typeof chatCompletionSchema>;

// ============================================================
// EMBEDDINGS
// ============================================================
export const embeddingsSchema = z.object({
  model: z.string().min(1),
  input: z.union([z.string(), z.array(z.string())]),
  encoding_format: z.enum(["float", "base64"]).optional().default("float"),
  dimensions: z.number().int().positive().optional(),
  user: z.string().optional(),
});
export type EmbeddingsDto = z.infer<typeof embeddingsSchema>;

// ============================================================
// IMAGE GENERATION
// ============================================================
export const imageGenerationSchema = z.object({
  model: z.string().default("dall-e-3"),
  prompt: z.string().min(1),
  n: z.number().int().positive().max(10).default(1),
  size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
  quality: z.enum(["standard", "hd"]).default("standard"),
  style: z.enum(["natural", "vivid"]).default("natural"),
  response_format: z.enum(["url", "b64_json"]).default("url"),
  user: z.string().optional(),
});
export type ImageGenerationDto = z.infer<typeof imageGenerationSchema>;

// ============================================================
// SPEECH (TTS)
// ============================================================
export const textToSpeechSchema = z.object({
  model: z.string().default("tts-1"),
  input: z.string().min(1),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).default("alloy"),
  response_format: z.enum(["mp3", "opus", "aac", "flac"]).default("mp3"),
  speed: z.number().min(0.25).max(4).default(1),
});
export type TextToSpeechDto = z.infer<typeof textToSpeechSchema>;

// ============================================================
// TRANSCRIPTION (STT)
// ============================================================
export const transcriptionSchema = z.object({
  model: z.string().default("whisper-1"),
  file: z.any(),
  language: z.string().optional(),
  prompt: z.string().optional(),
  response_format: z.enum(["json", "text", "srt", "verbose_json", "vtt"]).default("json"),
  temperature: z.number().min(0).max(1).default(0),
});
export type TranscriptionDto = z.infer<typeof transcriptionSchema>;

// ============================================================
// MODERATION
// ============================================================
export const moderationSchema = z.object({
  model: z.string().default("text-moderation-latest"),
  input: z.union([z.string(), z.array(z.string())]),
});
export type ModerationDto = z.infer<typeof moderationSchema>;
