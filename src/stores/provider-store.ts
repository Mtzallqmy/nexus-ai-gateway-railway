import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Provider, ID } from "@/types";

interface ProviderState {
  providers: Provider[];
  activeProviderId: ID | null;
  selectedProviderId: ID | null;
  setActiveProvider: (id: ID) => void;
  selectProvider: (id: ID | null) => void;
  setProviders: (providers: Provider[]) => void;
  upsertProvider: (provider: Provider) => void;
  removeProvider: (id: ID) => void;
  getActiveProvider: () => Provider | undefined;
}

const initialProviders: Provider[] = [
  {
    id: "prv_openai",
    name: "OpenAI",
    slug: "openai",
    description: "GPT-4, GPT-3.5, and other OpenAI models",
    status: "active",
    baseUrl: "https://api.openai.com/v1",
    region: "us-east-1",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "function-calling"],
    latencyMs: 320,
    uptimePct: 99.98,
    requestCount: 1284502,
    errorRate: 0.12,
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prv_anthropic",
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude family of models with constitutional AI",
    status: "active",
    baseUrl: "https://api.anthropic.com/v1",
    region: "us-west-2",
    supportedFeatures: ["chat", "completions", "vision", "function-calling", "long-context"],
    latencyMs: 410,
    uptimePct: 99.95,
    requestCount: 842158,
    errorRate: 0.18,
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prv_google",
    name: "Google AI",
    slug: "google",
    description: "Gemini models from Google DeepMind",
    status: "active",
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    region: "global",
    supportedFeatures: ["chat", "completions", "embeddings", "vision", "code"],
    latencyMs: 280,
    uptimePct: 99.92,
    requestCount: 615847,
    errorRate: 0.22,
    createdAt: "2024-02-01T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prv_mistral",
    name: "Mistral AI",
    slug: "mistral",
    description: "European LLMs with strong multilingual support",
    status: "active",
    baseUrl: "https://api.mistral.ai/v1",
    region: "eu-west-1",
    supportedFeatures: ["chat", "completions", "embeddings", "function-calling"],
    latencyMs: 195,
    uptimePct: 99.89,
    requestCount: 318447,
    errorRate: 0.31,
    createdAt: "2024-03-12T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prv_cohere",
    name: "Cohere",
    slug: "cohere",
    description: "Enterprise-grade language models and embeddings",
    status: "inactive",
    baseUrl: "https://api.cohere.ai/v1",
    region: "us-east-1",
    supportedFeatures: ["chat", "embeddings", "rerank", "classify"],
    latencyMs: 240,
    uptimePct: 99.85,
    requestCount: 89415,
    errorRate: 0.45,
    createdAt: "2024-04-05T08:00:00.000Z",
    updatedAt: new Date().toISOString(),
  },
];

export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      providers: initialProviders,
      activeProviderId: "prv_openai",
      selectedProviderId: null,

      setActiveProvider: (id) => set({ activeProviderId: id }),
      selectProvider: (id) => set({ selectedProviderId: id }),
      setProviders: (providers) => set({ providers }),

      upsertProvider: (provider) => {
        const existing = get().providers;
        const idx = existing.findIndex((p) => p.id === provider.id);
        if (idx >= 0) {
          const next = [...existing];
          next[idx] = provider;
          set({ providers: next });
        } else {
          set({ providers: [...existing, provider] });
        }
      },

      removeProvider: (id) => {
        set({ providers: get().providers.filter((p) => p.id !== id) });
      },

      getActiveProvider: () => {
        const state = get();
        return state.providers.find((p) => p.id === state.activeProviderId);
      },
    }),
    {
      name: "moataz-providers",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        activeProviderId: state.activeProviderId,
        selectedProviderId: state.selectedProviderId,
      }),
    }
  )
);
