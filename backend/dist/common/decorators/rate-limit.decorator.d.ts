export declare const RATE_LIMIT_KEY = "rateLimit";
export interface RateLimitConfig {
    ttl: number;
    limit: number;
}
export declare const RateLimit: (config: RateLimitConfig) => import("@nestjs/common").CustomDecorator<string>;
