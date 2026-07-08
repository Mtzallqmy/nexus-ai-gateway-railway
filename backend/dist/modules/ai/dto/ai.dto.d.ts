import { z } from "zod";
export declare const chatCompletionSchema: z.ZodObject<{
    model: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant", "tool"]>;
        content: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["text", "image_url", "input_audio"]>;
            text: z.ZodOptional<z.ZodString>;
            image_url: z.ZodOptional<z.ZodObject<{
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
            }, {
                url: string;
            }>>;
            input_audio: z.ZodOptional<z.ZodObject<{
                data: z.ZodString;
                format: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                data: string;
                format: string;
            }, {
                data: string;
                format: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }, {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }>, "many">]>;
        name: z.ZodOptional<z.ZodString>;
        tool_call_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        role: "user" | "system" | "assistant" | "tool";
        content: string | {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }[];
        name?: string | undefined;
        tool_call_id?: string | undefined;
    }, {
        role: "user" | "system" | "assistant" | "tool";
        content: string | {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }[];
        name?: string | undefined;
        tool_call_id?: string | undefined;
    }>, "many">;
    temperature: z.ZodOptional<z.ZodNumber>;
    top_p: z.ZodOptional<z.ZodNumber>;
    top_k: z.ZodOptional<z.ZodNumber>;
    max_tokens: z.ZodOptional<z.ZodNumber>;
    max_completion_tokens: z.ZodOptional<z.ZodNumber>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    stop: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    presence_penalty: z.ZodOptional<z.ZodNumber>;
    frequency_penalty: z.ZodOptional<z.ZodNumber>;
    seed: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
    n: z.ZodOptional<z.ZodNumber>;
    logprobs: z.ZodOptional<z.ZodBoolean>;
    top_logprobs: z.ZodOptional<z.ZodNumber>;
    response_format: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["text", "json_object", "json_schema"]>;
        json_schema: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            schema: Record<string, unknown>;
        }, {
            name: string;
            schema: Record<string, unknown>;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "text" | "json_object" | "json_schema";
        json_schema?: {
            name: string;
            schema: Record<string, unknown>;
        } | undefined;
    }, {
        type: "text" | "json_object" | "json_schema";
        json_schema?: {
            name: string;
            schema: Record<string, unknown>;
        } | undefined;
    }>>;
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodLiteral<"function">;
        function: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        }, {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        function: {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        };
        type: "function";
    }, {
        function: {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        };
        type: "function";
    }>, "many">>;
    tool_choice: z.ZodOptional<z.ZodUnion<[z.ZodEnum<["auto", "none", "required"]>, z.ZodObject<{
        type: z.ZodLiteral<"function">;
        function: z.ZodObject<{
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
        }, {
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        function: {
            name: string;
        };
        type: "function";
    }, {
        function: {
            name: string;
        };
        type: "function";
    }>]>>;
    reasoning_effort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    stream: boolean;
    model: string;
    messages: {
        role: "user" | "system" | "assistant" | "tool";
        content: string | {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }[];
        name?: string | undefined;
        tool_call_id?: string | undefined;
    }[];
    user?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
    temperature?: number | undefined;
    max_tokens?: number | undefined;
    top_p?: number | undefined;
    stop?: string | string[] | undefined;
    presence_penalty?: number | undefined;
    frequency_penalty?: number | undefined;
    top_k?: number | undefined;
    max_completion_tokens?: number | undefined;
    seed?: number | undefined;
    n?: number | undefined;
    logprobs?: boolean | undefined;
    top_logprobs?: number | undefined;
    response_format?: {
        type: "text" | "json_object" | "json_schema";
        json_schema?: {
            name: string;
            schema: Record<string, unknown>;
        } | undefined;
    } | undefined;
    tools?: {
        function: {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        };
        type: "function";
    }[] | undefined;
    tool_choice?: "none" | "auto" | "required" | {
        function: {
            name: string;
        };
        type: "function";
    } | undefined;
    reasoning_effort?: "low" | "medium" | "high" | undefined;
}, {
    model: string;
    messages: {
        role: "user" | "system" | "assistant" | "tool";
        content: string | {
            type: "text" | "image_url" | "input_audio";
            text?: string | undefined;
            image_url?: {
                url: string;
            } | undefined;
            input_audio?: {
                data: string;
                format: string;
            } | undefined;
        }[];
        name?: string | undefined;
        tool_call_id?: string | undefined;
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
    top_k?: number | undefined;
    max_completion_tokens?: number | undefined;
    seed?: number | undefined;
    n?: number | undefined;
    logprobs?: boolean | undefined;
    top_logprobs?: number | undefined;
    response_format?: {
        type: "text" | "json_object" | "json_schema";
        json_schema?: {
            name: string;
            schema: Record<string, unknown>;
        } | undefined;
    } | undefined;
    tools?: {
        function: {
            name: string;
            parameters: Record<string, unknown>;
            description?: string | undefined;
        };
        type: "function";
    }[] | undefined;
    tool_choice?: "none" | "auto" | "required" | {
        function: {
            name: string;
        };
        type: "function";
    } | undefined;
    reasoning_effort?: "low" | "medium" | "high" | undefined;
}>;
export type ChatCompletionDto = z.infer<typeof chatCompletionSchema>;
export declare const embeddingsSchema: z.ZodObject<{
    model: z.ZodString;
    input: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    encoding_format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["float", "base64"]>>>;
    dimensions: z.ZodOptional<z.ZodNumber>;
    user: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: string;
    input: string | string[];
    encoding_format: "base64" | "float";
    user?: string | undefined;
    dimensions?: number | undefined;
}, {
    model: string;
    input: string | string[];
    user?: string | undefined;
    encoding_format?: "base64" | "float" | undefined;
    dimensions?: number | undefined;
}>;
export type EmbeddingsDto = z.infer<typeof embeddingsSchema>;
export declare const imageGenerationSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    prompt: z.ZodString;
    n: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodEnum<["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]>>;
    quality: z.ZodDefault<z.ZodEnum<["standard", "hd"]>>;
    style: z.ZodDefault<z.ZodEnum<["natural", "vivid"]>>;
    response_format: z.ZodDefault<z.ZodEnum<["url", "b64_json"]>>;
    user: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    model: string;
    n: number;
    response_format: "url" | "b64_json";
    prompt: string;
    size: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
    quality: "standard" | "hd";
    style: "natural" | "vivid";
    user?: string | undefined;
}, {
    prompt: string;
    user?: string | undefined;
    model?: string | undefined;
    n?: number | undefined;
    response_format?: "url" | "b64_json" | undefined;
    size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792" | undefined;
    quality?: "standard" | "hd" | undefined;
    style?: "natural" | "vivid" | undefined;
}>;
export type ImageGenerationDto = z.infer<typeof imageGenerationSchema>;
export declare const textToSpeechSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    input: z.ZodString;
    voice: z.ZodDefault<z.ZodEnum<["alloy", "echo", "fable", "onyx", "nova", "shimmer"]>>;
    response_format: z.ZodDefault<z.ZodEnum<["mp3", "opus", "aac", "flac"]>>;
    speed: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model: string;
    input: string;
    response_format: "mp3" | "opus" | "aac" | "flac";
    voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
    speed: number;
}, {
    input: string;
    model?: string | undefined;
    response_format?: "mp3" | "opus" | "aac" | "flac" | undefined;
    voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | undefined;
    speed?: number | undefined;
}>;
export type TextToSpeechDto = z.infer<typeof textToSpeechSchema>;
export declare const transcriptionSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    file: z.ZodAny;
    language: z.ZodOptional<z.ZodString>;
    prompt: z.ZodOptional<z.ZodString>;
    response_format: z.ZodDefault<z.ZodEnum<["json", "text", "srt", "verbose_json", "vtt"]>>;
    temperature: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    model: string;
    temperature: number;
    response_format: "json" | "text" | "srt" | "verbose_json" | "vtt";
    prompt?: string | undefined;
    file?: any;
    language?: string | undefined;
}, {
    model?: string | undefined;
    temperature?: number | undefined;
    response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt" | undefined;
    prompt?: string | undefined;
    file?: any;
    language?: string | undefined;
}>;
export type TranscriptionDto = z.infer<typeof transcriptionSchema>;
export declare const moderationSchema: z.ZodObject<{
    model: z.ZodDefault<z.ZodString>;
    input: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strip", z.ZodTypeAny, {
    model: string;
    input: string | string[];
}, {
    input: string | string[];
    model?: string | undefined;
}>;
export type ModerationDto = z.infer<typeof moderationSchema>;
