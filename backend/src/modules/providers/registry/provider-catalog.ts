/**
 * Provider Registry — Static catalog of all 20+ supported AI providers.
 *
 * This is the source of truth for what providers the platform supports.
 * Each entry contains the provider's display info, supported features,
 * capabilities, and metadata that drives the UI and validation logic.
 *
 * Providers are NEVER contacted directly — all inference goes through LiteLLM.
 * This registry is purely metadata for management and discovery.
 */

export interface ProviderCatalogEntry {
  name: string;
  slug: string;
  displayName: string;
  description: string;
  type: string;
  websiteUrl?: string;
  docsUrl?: string;
  supportedFeatures: string[];
  supportedCapabilities: string[];
  defaultModels: string[];
  apiVersion?: string;
  authType: string;
  litellmPrefix: string; // LiteLLM model prefix (e.g., "openai/", "anthropic/")
  capabilities: {
    vision: boolean;
    image: boolean;
    audio: boolean;
    speech: boolean;
    embeddings: boolean;
    moderation: boolean;
    functionCalling: boolean;
    streaming: boolean;
    jsonMode: boolean;
    thinking: boolean;
    reasoning: boolean;
    toolCalling: boolean;
    structuredOutput: boolean;
  };
}

export const PROVIDER_CATALOG: ProviderCatalogEntry[] = [
  {
    name: "openai",
    slug: "openai",
    displayName: "OpenAI",
    description: "GPT-4, GPT-3.5, DALL-E, Whisper, and Embeddings",
    type: "OPENAI",
    websiteUrl: "https://openai.com",
    docsUrl: "https://platform.openai.com/docs",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "function-calling", "json-mode", "streaming", "images", "audio", "moderation"],
    supportedCapabilities: ["chat", "completions", "embeddings", "vision", "function-calling", "json-mode", "streaming", "images", "audio", "moderation"],
    defaultModels: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo", "text-embedding-3-small", "dall-e-3", "whisper-1", "tts-1"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "openai/",
    capabilities: { vision: true, image: true, audio: true, speech: true, embeddings: true, moderation: true, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "anthropic",
    slug: "anthropic",
    displayName: "Anthropic",
    description: "Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku",
    type: "ANTHROPIC",
    websiteUrl: "https://anthropic.com",
    docsUrl: "https://docs.anthropic.com",
    supportedFeatures: ["chat", "completions", "vision", "function-calling", "streaming", "long-context"],
    supportedCapabilities: ["chat", "completions", "vision", "function-calling", "streaming", "long-context"],
    defaultModels: ["claude-3-5-sonnet-20240620", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    apiVersion: "v1",
    authType: "x-api-key",
    litellmPrefix: "anthropic/",
    capabilities: { vision: true, image: false, audio: false, speech: false, embeddings: false, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: true, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "google",
    slug: "google",
    displayName: "Google AI Studio",
    description: "Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini Pro Vision",
    type: "GOOGLE",
    websiteUrl: "https://ai.google.dev",
    docsUrl: "https://ai.google.dev/docs",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "code", "streaming", "audio", "video"],
    supportedCapabilities: ["chat", "completions", "embeddings", "vision", "code", "streaming", "audio", "video"],
    defaultModels: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro-vision", "text-embedding-004"],
    apiVersion: "v1",
    authType: "query",
    litellmPrefix: "gemini/",
    capabilities: { vision: true, image: false, audio: true, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "vertex_ai",
    slug: "vertex-ai",
    displayName: "Vertex AI",
    description: "Google Cloud Vertex AI — Gemini, PaLM, and Codey models",
    type: "GOOGLE",
    websiteUrl: "https://cloud.google.com/vertex-ai",
    docsUrl: "https://cloud.google.com/vertex-ai/docs",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "code", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "vision", "code", "streaming"],
    defaultModels: ["gemini-1.5-pro", "gemini-1.5-flash", "textembedding-gecko"],
    apiVersion: "v1",
    authType: "oauth",
    litellmPrefix: "vertex_ai/",
    capabilities: { vision: true, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "openrouter",
    slug: "openrouter",
    displayName: "OpenRouter",
    description: "Access 100+ AI models through a single API",
    type: "OPENROUTER",
    websiteUrl: "https://openrouter.ai",
    docsUrl: "https://openrouter.ai/docs",
    supportedFeatures: ["chat", "completions", "streaming", "function-calling"],
    supportedCapabilities: ["chat", "completions", "streaming", "function-calling"],
    defaultModels: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "openrouter/",
    capabilities: { vision: true, image: false, audio: false, speech: false, embeddings: false, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: true, structuredOutput: false },
  },
  {
    name: "nvidia_nim",
    slug: "nvidia-nim",
    displayName: "NVIDIA NIM",
    description: "NVIDIA NIM microservices for optimized inference",
    type: "NVIDIA",
    websiteUrl: "https://developer.nvidia.com/nim",
    docsUrl: "https://docs.nvidia.com/nim",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming"],
    defaultModels: ["nvidia/llama-3.1-nemotron-70b-instruct", "nvidia/nv-embed-v1"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "nvidia_nim/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
  {
    name: "huggingface",
    slug: "huggingface",
    displayName: "Hugging Face",
    description: "Serverless inference for 100,000+ models",
    type: "HUGGINGFACE",
    websiteUrl: "https://huggingface.co",
    docsUrl: "https://huggingface.co/docs/inference-endpoints",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming"],
    defaultModels: ["meta-llama/Llama-3.1-70B-Instruct", "mistralai/Mistral-7B-Instruct"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "huggingface/",
    capabilities: { vision: false, image: true, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
  {
    name: "groq",
    slug: "groq",
    displayName: "Groq",
    description: "Ultra-fast inference for Llama, Mixtral, and Gemma models",
    type: "CUSTOM",
    websiteUrl: "https://groq.com",
    docsUrl: "https://console.groq.com/docs",
    supportedFeatures: ["chat", "completions", "streaming", "function-calling"],
    supportedCapabilities: ["chat", "completions", "streaming", "function-calling"],
    defaultModels: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "groq/",
    capabilities: { vision: false, image: false, audio: false, speech: true, embeddings: false, moderation: false, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: false, toolCalling: true, structuredOutput: true },
  },
  {
    name: "together_ai",
    slug: "together-ai",
    displayName: "Together AI",
    description: "Fast, cost-effective inference for open-source models",
    type: "CUSTOM",
    websiteUrl: "https://together.ai",
    docsUrl: "https://docs.together.ai",
    supportedFeatures: ["chat", "completions", "embeddings", "images", "streaming", "function-calling"],
    supportedCapabilities: ["chat", "completions", "embeddings", "images", "streaming", "function-calling"],
    defaultModels: ["meta-llama/Llama-3.1-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "together_ai/",
    capabilities: { vision: false, image: true, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: true, structuredOutput: false },
  },
  {
    name: "fireworks_ai",
    slug: "fireworks-ai",
    displayName: "Fireworks AI",
    description: "High-speed inference for open-source LLMs",
    type: "CUSTOM",
    websiteUrl: "https://fireworks.ai",
    docsUrl: "https://docs.fireworks.ai",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming", "function-calling"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming", "function-calling"],
    defaultModels: ["accounts/fireworks/models/llama-v3.1-70b-instruct", "accounts/fireworks/models/llama-v3.1-8b-instruct"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "fireworks_ai/",
    capabilities: { vision: false, image: true, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: false, toolCalling: true, structuredOutput: true },
  },
  {
    name: "deepseek",
    slug: "deepseek",
    displayName: "DeepSeek",
    description: "Cost-effective reasoning and coding models",
    type: "CUSTOM",
    websiteUrl: "https://deepseek.com",
    docsUrl: "https://platform.deepseek.com/docs",
    supportedFeatures: ["chat", "completions", "streaming", "function-calling", "reasoning"],
    supportedCapabilities: ["chat", "completions", "streaming", "function-calling", "reasoning"],
    defaultModels: ["deepseek-chat", "deepseek-reasoner", "deepseek-coder"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "deepseek/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: false, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: true, reasoning: true, toolCalling: true, structuredOutput: false },
  },
  {
    name: "mistral",
    slug: "mistral",
    displayName: "Mistral AI",
    description: "European LLMs with strong multilingual support",
    type: "MISTRAL",
    websiteUrl: "https://mistral.ai",
    docsUrl: "https://docs.mistral.ai",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming", "function-calling", "json-mode"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming", "function-calling", "json-mode"],
    defaultModels: ["mistral-large-latest", "mistral-small-latest", "open-mistral-nemo", "mistral-embed"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "mistral/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "cohere",
    slug: "cohere",
    displayName: "Cohere",
    description: "Enterprise-grade language models and embeddings",
    type: "COHERE",
    websiteUrl: "https://cohere.com",
    docsUrl: "https://docs.cohere.com",
    supportedFeatures: ["chat", "completions", "embeddings", "rerank", "classify", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "rerank", "classify", "streaming"],
    defaultModels: ["command-r-plus", "command-r", "embed-english-v3.0"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "cohere/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: true, structuredOutput: false },
  },
  {
    name: "azure",
    slug: "azure-openai",
    displayName: "Azure OpenAI",
    description: "OpenAI models deployed on Azure cloud",
    type: "AZURE",
    websiteUrl: "https://azure.microsoft.com/openai",
    docsUrl: "https://learn.microsoft.com/azure/ai-services/openai",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "function-calling", "json-mode", "streaming", "images", "audio"],
    supportedCapabilities: ["chat", "completions", "embeddings", "vision", "function-calling", "json-mode", "streaming", "images", "audio"],
    defaultModels: ["gpt-4o", "gpt-4", "gpt-35-turbo", "text-embedding-ada-002"],
    apiVersion: "2024-02-01",
    authType: "api-key",
    litellmPrefix: "azure/",
    capabilities: { vision: true, image: true, audio: true, speech: true, embeddings: true, moderation: true, functionCalling: true, streaming: true, jsonMode: true, thinking: false, reasoning: true, toolCalling: true, structuredOutput: true },
  },
  {
    name: "bedrock",
    slug: "bedrock",
    displayName: "AWS Bedrock",
    description: "Amazon Bedrock — Claude, Llama, Titan, and more",
    type: "AWS",
    websiteUrl: "https://aws.amazon.com/bedrock",
    docsUrl: "https://docs.aws.amazon.com/bedrock",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming", "function-calling"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming", "function-calling"],
    defaultModels: ["anthropic.claude-3-5-sonnet-20240620-v1:0", "meta.llama3-1-70b-instruct-v1:0"],
    apiVersion: "2023-10-01",
    authType: "aws",
    litellmPrefix: "bedrock/",
    capabilities: { vision: true, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: false, reasoning: true, toolCalling: true, structuredOutput: false },
  },
  {
    name: "ollama",
    slug: "ollama",
    displayName: "Ollama",
    description: "Run LLMs locally on your own machine",
    type: "CUSTOM",
    websiteUrl: "https://ollama.ai",
    docsUrl: "https://github.com/ollama/ollama",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming"],
    defaultModels: ["llama3.1", "qwen2.5", "mistral", "phi3"],
    apiVersion: "v1",
    authType: "none",
    litellmPrefix: "ollama/",
    capabilities: { vision: true, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
  {
    name: "lm_studio",
    slug: "lm-studio",
    displayName: "LM Studio",
    description: "Local model inference with OpenAI-compatible API",
    type: "CUSTOM",
    websiteUrl: "https://lmstudio.ai",
    docsUrl: "https://lmstudio.ai/docs",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming"],
    defaultModels: ["local-model"],
    apiVersion: "v1",
    authType: "none",
    litellmPrefix: "lm_studio/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
  {
    name: "openai_compatible",
    slug: "openai-compatible",
    displayName: "OpenAI Compatible",
    description: "Any API that implements the OpenAI-compatible interface",
    type: "CUSTOM",
    websiteUrl: "",
    docsUrl: "",
    supportedFeatures: ["chat", "completions", "streaming"],
    supportedCapabilities: ["chat", "completions", "streaming"],
    defaultModels: [],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "openai/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: false, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
  {
    name: "opencode",
    slug: "opencode",
    displayName: "OpenCode",
    description: "Code-specialized AI models for programming tasks",
    type: "CUSTOM",
    websiteUrl: "",
    docsUrl: "",
    supportedFeatures: ["chat", "completions", "code", "streaming"],
    supportedCapabilities: ["chat", "completions", "code", "streaming"],
    defaultModels: ["opencode-1", "opencode-mini"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "opencode/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: false, moderation: false, functionCalling: true, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: true, structuredOutput: false },
  },
  {
    name: "openmodel",
    slug: "openmodel",
    displayName: "OpenModel",
    description: "Open-weight model hosting platform",
    type: "CUSTOM",
    websiteUrl: "",
    docsUrl: "",
    supportedFeatures: ["chat", "completions", "embeddings", "streaming"],
    supportedCapabilities: ["chat", "completions", "embeddings", "streaming"],
    defaultModels: ["openmodel-1"],
    apiVersion: "v1",
    authType: "bearer",
    litellmPrefix: "openmodel/",
    capabilities: { vision: false, image: false, audio: false, speech: false, embeddings: true, moderation: false, functionCalling: false, streaming: true, jsonMode: false, thinking: false, reasoning: false, toolCalling: false, structuredOutput: false },
  },
];

export function getProviderBySlug(slug: string): ProviderCatalogEntry | undefined {
  return PROVIDER_CATALOG.find((p) => p.slug === slug);
}

export function getProviderByName(name: string): ProviderCatalogEntry | undefined {
  return PROVIDER_CATALOG.find((p) => p.name === name);
}

export function listProviderSlugs(): string[] {
  return PROVIDER_CATALOG.map((p) => p.slug);
}
