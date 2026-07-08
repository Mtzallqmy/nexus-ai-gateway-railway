/**
 * LiteLLM Module — DTOs (Zod schemas + inferred types)
 */
import { z } from "zod";

// ============================================================
// REQUEST DTOs
// ============================================================

export const chatCompletionSchema = z.object({
  model: z.string().min(1, "Model is required"),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant", "tool"]),
        content: z.string().min(1),
      })
    )
    .min(1, "At least one message is required"),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().max(8192).optional(),
  top_p: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional().default(false),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  user: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type ChatCompletionDto = z.infer<typeof chatCompletionSchema>;

export const embeddingsSchema = z.object({
  model: z.string().min(1),
  input: z.union([z.string(), z.array(z.string())]),
  encoding_format: z.enum(["float", "base64"]).optional(),
  dimensions: z.number().int().positive().optional(),
});
export type EmbeddingsDto = z.infer<typeof embeddingsSchema>;

export const syncSchema = z.object({
  entityType: z.enum(["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]).default("ALL"),
  force: z.boolean().optional().default(false),
});
export type SyncDto = z.infer<typeof syncSchema>;

// ============================================================
// QUERY DTOs
// ============================================================

export const listModelsQuerySchema = z.object({
  providerId: z.string().uuid().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
});
export type ListModelsQueryDto = z.infer<typeof listModelsQuerySchema>;

export const syncHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.enum(["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]).optional(),
  status: z.enum(["PENDING", "RUNNING", "SUCCESS", "FAILED", "PARTIAL"]).optional(),
});
export type SyncHistoryQueryDto = z.infer<typeof syncHistoryQuerySchema>;
