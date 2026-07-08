import { z } from "zod";

// ============================================================
// PLAYGROUND DTOs
// ============================================================

export const createConversationSchema = z.object({
  title: z.string().default("New Conversation"),
  type: z.enum(["CHAT", "COMPLETION", "RESPONSES", "EMBEDDINGS", "IMAGES", "VISION", "SPEECH_TO_TEXT", "TEXT_TO_SPEECH", "AUDIO_TRANSLATION", "MODERATION"]).default("CHAT"),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  systemPrompt: z.string().optional(),
  parameters: z.record(z.unknown()).default({}),
});
export type CreateConversationDto = z.infer<typeof createConversationSchema>;

export const updateConversationSchema = z.object({
  title: z.string().optional(),
  systemPrompt: z.string().optional(),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateConversationDto = z.infer<typeof updateConversationSchema>;

export const addMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  metadata: z.record(z.unknown()).optional(),
});
export type AddMessageDto = z.infer<typeof addMessageSchema>;

export const sendMessageSchema = z.object({
  message: z.string().min(1),
  stream: z.boolean().optional().default(false),
  parameters: z.record(z.unknown()).optional(),
});
export type SendMessageDto = z.infer<typeof sendMessageSchema>;

export const listConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  search: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "lastMessageAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListConversationsQueryDto = z.infer<typeof listConversationsQuerySchema>;

// ============================================================
// SAVED PROMPTS
// ============================================================
export const createSavedPromptSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  content: z.string().min(1),
  systemPrompt: z.string().optional(),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  parameters: z.record(z.unknown()).default({}),
  isFavorite: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  collectionId: z.string().uuid().optional(),
});
export type CreateSavedPromptDto = z.infer<typeof createSavedPromptSchema>;

export const updateSavedPromptSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  systemPrompt: z.string().optional(),
  providerName: z.string().optional(),
  modelName: z.string().optional(),
  parameters: z.record(z.unknown()).optional(),
  isFavorite: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  collectionId: z.string().uuid().nullable().optional(),
});
export type UpdateSavedPromptDto = z.infer<typeof updateSavedPromptSchema>;

export const listSavedPromptsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  isFavorite: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  collectionId: z.string().uuid().optional(),
  tags: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "useCount", "title"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
export type ListSavedPromptsQueryDto = z.infer<typeof listSavedPromptsQuerySchema>;

// ============================================================
// COLLECTIONS
// ============================================================
export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  isPublic: z.boolean().default(false),
  color: z.string().optional(),
});
export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;

export const updateCollectionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  color: z.string().optional(),
});
export type UpdateCollectionDto = z.infer<typeof updateCollectionSchema>;
