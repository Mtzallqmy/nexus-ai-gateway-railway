import { SetMetadata } from "@nestjs/common";

export const RATE_LIMIT_KEY = "rateLimit";

export interface RateLimitConfig {
  ttl: number; // seconds
  limit: number; // requests per ttl window
}

/**
 * Override the global rate limit for a specific route.
 * @example
 *   @RateLimit({ ttl: 60, limit: 5 })
 *   @Post('login')
 *   login() { ... }
 */
export const RateLimit = (config: RateLimitConfig) => SetMetadata(RATE_LIMIT_KEY, config);
