import { ConfigService } from "@nestjs/config";
import type { LiteLLMConfig } from "./litellm.types";
export declare function loadLiteLLMConfig(config: ConfigService): LiteLLMConfig;
export type { LiteLLMConfig };
