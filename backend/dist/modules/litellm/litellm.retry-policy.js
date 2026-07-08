"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiteLLMRetryPolicy = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMRetryPolicy = class LiteLLMRetryPolicy {
    maxAttempts;
    baseDelayMs;
    maxDelayMs = litellm_constants_1.LITELLM_DEFAULTS.RETRY_MAX_DELAY_MS;
    constructor(maxAttempts, baseDelayMs) {
        this.maxAttempts = maxAttempts ?? litellm_constants_1.LITELLM_DEFAULTS.RETRY_ATTEMPTS;
        this.baseDelayMs = baseDelayMs ?? litellm_constants_1.LITELLM_DEFAULTS.RETRY_BASE_DELAY_MS;
    }
    shouldRetry(attempt, error) {
        if (attempt >= this.maxAttempts)
            return false;
        const err = error;
        if (!err)
            return false;
        const networkCodes = ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED", "EPIPE", "EAI_AGAIN"];
        if (err.code && networkCodes.includes(err.code))
            return true;
        if (err.name === "AbortError")
            return true;
        if (err.name === "TypeError" && typeof err.message === "string" && err.message.includes("fetch"))
            return true;
        const status = err.status;
        if (typeof status === "number") {
            if (status >= 500 && status < 600)
                return true;
            if (status === 429)
                return true;
            if (status === 408)
                return true;
        }
        return false;
    }
    getDelay(attempt) {
        const ceiling = Math.min(this.baseDelayMs * Math.pow(2, attempt), this.maxDelayMs);
        return Math.floor(Math.random() * ceiling);
    }
    getMaxAttempts() {
        return this.maxAttempts;
    }
};
exports.LiteLLMRetryPolicy = LiteLLMRetryPolicy;
exports.LiteLLMRetryPolicy = LiteLLMRetryPolicy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Number, Number])
], LiteLLMRetryPolicy);
//# sourceMappingURL=litellm.retry-policy.js.map