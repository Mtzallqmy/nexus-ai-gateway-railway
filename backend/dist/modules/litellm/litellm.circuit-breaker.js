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
exports.LiteLLMCircuitBreaker = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMCircuitBreaker = class LiteLLMCircuitBreaker {
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.CIRCUIT);
    entries = new Map();
    failureThreshold;
    resetTimeoutMs;
    constructor(failureThreshold = 5, resetTimeoutMs = 60_000) {
        this.failureThreshold = failureThreshold;
        this.resetTimeoutMs = resetTimeoutMs;
    }
    getState(providerKey) {
        const entry = this.entries.get(providerKey);
        if (!entry)
            return "CLOSED";
        this.maybeHalfOpen(entry);
        return entry.state;
    }
    isOpen(providerKey) {
        return this.getState(providerKey) === "OPEN";
    }
    recordSuccess(providerKey) {
        const entry = this.entries.get(providerKey);
        if (!entry)
            return;
        if (entry.state !== "CLOSED") {
            this.logger.log(`Circuit CLOSED for '${providerKey}' (recovered)`);
        }
        entry.state = "CLOSED";
        entry.failureCount = 0;
        entry.openedAt = null;
        entry.lastFailureAt = null;
    }
    recordFailure(providerKey) {
        let entry = this.entries.get(providerKey);
        if (!entry) {
            entry = { state: "CLOSED", failureCount: 0, lastFailureAt: null, openedAt: null };
            this.entries.set(providerKey, entry);
        }
        entry.failureCount++;
        entry.lastFailureAt = Date.now();
        this.maybeHalfOpen(entry);
        if (entry.state === "HALF_OPEN") {
            entry.state = "OPEN";
            entry.openedAt = Date.now();
            this.logger.warn(`Circuit re-OPENED for '${providerKey}' (HALF_OPEN probe failed)`);
            return true;
        }
        if (entry.failureCount >= this.failureThreshold && entry.state !== "OPEN") {
            entry.state = "OPEN";
            entry.openedAt = Date.now();
            this.logger.warn(`Circuit OPENED for '${providerKey}' (failures=${entry.failureCount} >= threshold=${this.failureThreshold})`);
            return true;
        }
        return false;
    }
    reset(providerKey) {
        if (providerKey) {
            this.entries.delete(providerKey);
            this.logger.log(`Circuit manually reset for '${providerKey}'`);
        }
        else {
            this.entries.clear();
            this.logger.log(`All circuits manually reset`);
        }
    }
    getAll() {
        return Array.from(this.entries.entries()).map(([key, entry]) => ({
            key,
            state: entry.state,
            failureCount: entry.failureCount,
            lastFailureAt: entry.lastFailureAt ? new Date(entry.lastFailureAt).toISOString() : null,
        }));
    }
    maybeHalfOpen(entry) {
        if (entry.state === "OPEN" && entry.openedAt !== null) {
            if (Date.now() - entry.openedAt >= this.resetTimeoutMs) {
                entry.state = "HALF_OPEN";
                this.logger.log(`Circuit HALF_OPEN (probe allowed)`);
            }
        }
    }
};
exports.LiteLLMCircuitBreaker = LiteLLMCircuitBreaker;
exports.LiteLLMCircuitBreaker = LiteLLMCircuitBreaker = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object])
], LiteLLMCircuitBreaker);
//# sourceMappingURL=litellm.circuit-breaker.js.map