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
    litellmPrefix: string;
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
export declare const PROVIDER_CATALOG: ProviderCatalogEntry[];
export declare function getProviderBySlug(slug: string): ProviderCatalogEntry | undefined;
export declare function getProviderByName(name: string): ProviderCatalogEntry | undefined;
export declare function listProviderSlugs(): string[];
