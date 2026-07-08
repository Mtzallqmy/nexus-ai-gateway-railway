import { z } from "zod";
export declare const chatCompletionSchema: z.ZodObject<{
    model: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "system" | "assistant" | "tool";
        content: string;
    }, {
        role: "user" | "system" | "assistant" | "tool";
        content: string;
    }>, "many">;
    temperature: z.ZodOptional<z.ZodNumber>;
    max_tokens: z.ZodOptional<z.ZodNumber>;
    top_p: z.ZodOptional<z.ZodNumber>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    stop: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    presence_penalty: z.ZodOptional<z.ZodNumber>;
    frequency_penalty: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    stream: boolean;
    model: string;
    messages: {
        role: "user" | "system" | "assistant" | "tool";
        content: string;
    }[];
    user?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    max_tokens?: number | undefined;
    top_p?: number | undefined;
    stop?: string | string[] | undefined;
    presence_penalty?: number | undefined;
    frequency_penalty?: number | undefined;
}, {
    model: string;
    messages: {
        role: "user" | "system" | "assistant" | "tool";
        content: string;
    }[];
    user?: string | undefined;
    stream?: boolean | undefined;
    metadata?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    max_tokens?: number | undefined;
    top_p?: number | undefined;
    stop?: string | string[] | undefined;
    presence_penalty?: number | undefined;
    frequency_penalty?: number | undefined;
}>;
export type ChatCompletionDto = z.infer<typeof chatCompletionSchema>;
export declare const embeddingsSchema: z.ZodObject<{
    model: z.ZodString;
    input: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    encoding_format: z.ZodOptional<z.ZodEnum<["float", "base64"]>>;
    dimensions: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model: string;
    input: string | string[];
    encoding_format?: "base64" | "float" | undefined;
    dimensions?: number | undefined;
}, {
    model: string;
    input: string | string[];
    encoding_format?: "base64" | "float" | undefined;
    dimensions?: number | undefined;
}>;
export type EmbeddingsDto = z.infer<typeof embeddingsSchema>;
export declare const syncSchema: z.ZodObject<{
    entityType: z.ZodDefault<z.ZodEnum<["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]>>;
    force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    entityType: "PROVIDERS" | "MODELS" | "CAPABILITIES" | "METADATA" | "VERSIONS" | "ALL";
    force: boolean;
}, {
    entityType?: "PROVIDERS" | "MODELS" | "CAPABILITIES" | "METADATA" | "VERSIONS" | "ALL" | undefined;
    force?: boolean | undefined;
}>;
export type SyncDto = z.infer<typeof syncSchema>;
export declare const listModelsQuerySchema: z.ZodObject<{
    providerId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    active?: boolean | undefined;
    providerId?: string | undefined;
}, {
    search?: string | undefined;
    active?: boolean | undefined;
    providerId?: string | undefined;
}>;
export type ListModelsQueryDto = z.infer<typeof listModelsQuerySchema>;
export declare const syncHistoryQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
    entityType: z.ZodOptional<z.ZodEnum<["PROVIDERS", "MODELS", "CAPABILITIES", "METADATA", "VERSIONS", "ALL"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "RUNNING", "SUCCESS", "FAILED", "PARTIAL"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "PENDING" | "SUCCESS" | "RUNNING" | "FAILED" | "PARTIAL" | undefined;
    entityType?: "PROVIDERS" | "MODELS" | "CAPABILITIES" | "METADATA" | "VERSIONS" | "ALL" | undefined;
}, {
    status?: "PENDING" | "SUCCESS" | "RUNNING" | "FAILED" | "PARTIAL" | undefined;
    limit?: number | undefined;
    entityType?: "PROVIDERS" | "MODELS" | "CAPABILITIES" | "METADATA" | "VERSIONS" | "ALL" | undefined;
}>;
export type SyncHistoryQueryDto = z.infer<typeof syncHistoryQuerySchema>;
