import { z } from "zod";
export declare const createConversationSchema: z.ZodObject<{
    title: z.ZodDefault<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["CHAT", "COMPLETION", "RESPONSES", "EMBEDDINGS", "IMAGES", "VISION", "SPEECH_TO_TEXT", "TEXT_TO_SPEECH", "AUDIO_TRANSLATION", "MODERATION"]>>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    parameters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "CHAT" | "COMPLETION" | "RESPONSES" | "EMBEDDINGS" | "IMAGES" | "VISION" | "SPEECH_TO_TEXT" | "TEXT_TO_SPEECH" | "AUDIO_TRANSLATION" | "MODERATION";
    title: string;
    parameters: Record<string, unknown>;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
}, {
    type?: "CHAT" | "COMPLETION" | "RESPONSES" | "EMBEDDINGS" | "IMAGES" | "VISION" | "SPEECH_TO_TEXT" | "TEXT_TO_SPEECH" | "AUDIO_TRANSLATION" | "MODERATION" | undefined;
    title?: string | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
}>;
export type CreateConversationDto = z.infer<typeof createConversationSchema>;
export declare const updateConversationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    isPinned?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    title?: string | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    isPinned?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export type UpdateConversationDto = z.infer<typeof updateConversationSchema>;
export declare const addMessageSchema: z.ZodObject<{
    role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
    content: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    role: "user" | "system" | "assistant" | "tool";
    content: string;
    metadata?: Record<string, unknown> | undefined;
}, {
    role: "user" | "system" | "assistant" | "tool";
    content: string;
    metadata?: Record<string, unknown> | undefined;
}>;
export type AddMessageDto = z.infer<typeof addMessageSchema>;
export declare const sendMessageSchema: z.ZodObject<{
    message: z.ZodString;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    stream: boolean;
    parameters?: Record<string, unknown> | undefined;
}, {
    message: string;
    stream?: boolean | undefined;
    parameters?: Record<string, unknown> | undefined;
}>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export declare const listConversationsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    type: z.ZodOptional<z.ZodString>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    isPinned: z.ZodOptional<z.ZodBoolean>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "title", "lastMessageAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "createdAt" | "updatedAt" | "title" | "lastMessageAt";
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    type?: string | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    isPinned?: boolean | undefined;
    isArchived?: boolean | undefined;
}, {
    search?: string | undefined;
    type?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "lastMessageAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    isPinned?: boolean | undefined;
    isArchived?: boolean | undefined;
}>;
export type ListConversationsQueryDto = z.infer<typeof listConversationsQuerySchema>;
export declare const createSavedPromptSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    systemPrompt: z.ZodOptional<z.ZodString>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    parameters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isFavorite: z.ZodDefault<z.ZodBoolean>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    collectionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isPublic: boolean;
    title: string;
    tags: string[];
    parameters: Record<string, unknown>;
    content: string;
    isFavorite: boolean;
    description?: string | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    collectionId?: string | undefined;
}, {
    title: string;
    content: string;
    isPublic?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    isFavorite?: boolean | undefined;
    collectionId?: string | undefined;
}>;
export type CreateSavedPromptDto = z.infer<typeof createSavedPromptSchema>;
export declare const updateSavedPromptSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    providerName: z.ZodOptional<z.ZodString>;
    modelName: z.ZodOptional<z.ZodString>;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    isFavorite: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    collectionId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    isPublic?: boolean | undefined;
    description?: string | undefined;
    title?: string | undefined;
    tags?: string[] | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    content?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    isFavorite?: boolean | undefined;
    collectionId?: string | null | undefined;
}, {
    isPublic?: boolean | undefined;
    description?: string | undefined;
    title?: string | undefined;
    tags?: string[] | undefined;
    parameters?: Record<string, unknown> | undefined;
    modelName?: string | undefined;
    content?: string | undefined;
    providerName?: string | undefined;
    systemPrompt?: string | undefined;
    isFavorite?: boolean | undefined;
    collectionId?: string | null | undefined;
}>;
export type UpdateSavedPromptDto = z.infer<typeof updateSavedPromptSchema>;
export declare const listSavedPromptsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    isFavorite: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    collectionId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "updatedAt", "useCount", "title"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    sortBy: "createdAt" | "updatedAt" | "title" | "useCount";
    sortOrder: "asc" | "desc";
    isPublic?: boolean | undefined;
    search?: string | undefined;
    tags?: string | undefined;
    isFavorite?: boolean | undefined;
    collectionId?: string | undefined;
}, {
    isPublic?: boolean | undefined;
    search?: string | undefined;
    tags?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "useCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isFavorite?: boolean | undefined;
    collectionId?: string | undefined;
}>;
export type ListSavedPromptsQueryDto = z.infer<typeof listSavedPromptsQuerySchema>;
export declare const createCollectionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isPublic: boolean;
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    isPublic?: boolean | undefined;
    description?: string | undefined;
    color?: string | undefined;
}>;
export type CreateCollectionDto = z.infer<typeof createCollectionSchema>;
export declare const updateCollectionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isPublic?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}, {
    isPublic?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    color?: string | undefined;
}>;
export type UpdateCollectionDto = z.infer<typeof updateCollectionSchema>;
