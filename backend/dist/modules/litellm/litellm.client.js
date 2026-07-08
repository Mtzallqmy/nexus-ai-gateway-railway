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
exports.LiteLLMClient = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
const litellm_retry_policy_1 = require("./litellm.retry-policy");
const litellm_circuit_breaker_1 = require("./litellm.circuit-breaker");
const litellm_connection_pool_1 = require("./litellm.connection-pool");
let LiteLLMClient = class LiteLLMClient {
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.CLIENT);
    config;
    retry;
    breaker;
    pool;
    constructor(config, retry, breaker, pool) {
        this.config = config;
        this.retry = retry;
        this.breaker = breaker;
        this.pool = pool;
        this.logger.log(`LiteLLM client initialized → ${config.baseUrl}`);
    }
    async getModels() {
        return this.request("GET", litellm_constants_1.LITELLM_ENDPOINTS.MODELS);
    }
    async getVersion() {
        return this.request("GET", litellm_constants_1.LITELLM_ENDPOINTS.VERSION);
    }
    async getHealthLiveness() {
        return this.request("GET", litellm_constants_1.LITELLM_ENDPOINTS.HEALTH_LIVENESS, undefined, 5_000);
    }
    async getHealthReadiness() {
        return this.request("GET", litellm_constants_1.LITELLM_ENDPOINTS.HEALTH_READINESS, undefined, 5_000);
    }
    async getHealthFull() {
        return this.request("GET", litellm_constants_1.LITELLM_ENDPOINTS.HEALTH_FULL, undefined, 10_000);
    }
    async reload() {
        return this.request("POST", litellm_constants_1.LITELLM_ENDPOINTS.RELOAD);
    }
    async chatCompletion(req) {
        const providerKey = req.model;
        if (this.breaker.isOpen(providerKey)) {
            throw new common_1.ServiceUnavailableException(`Circuit breaker open for model '${providerKey}'`);
        }
        try {
            const result = await this.request("POST", litellm_constants_1.LITELLM_ENDPOINTS.CHAT_COMPLETIONS, req);
            this.breaker.recordSuccess(providerKey);
            return result;
        }
        catch (err) {
            this.breaker.recordFailure(providerKey);
            throw err;
        }
    }
    async *chatCompletionStream(req) {
        const providerKey = req.model;
        if (this.breaker.isOpen(providerKey)) {
            throw new common_1.ServiceUnavailableException(`Circuit breaker open for model '${providerKey}'`);
        }
        const url = `${this.config.baseUrl}${litellm_constants_1.LITELLM_ENDPOINTS.CHAT_COMPLETIONS}`;
        const startedAt = Date.now();
        this.logger.log(`STREAM POST ${litellm_constants_1.LITELLM_ENDPOINTS.CHAT_COMPLETIONS} model=${req.model}`);
        try {
            const response = await this.pool.withConnection(() => fetch(url, {
                method: "POST",
                headers: this.buildHeaders(true),
                body: JSON.stringify({ ...req, stream: true }),
                signal: AbortSignal.timeout(this.config.streamTimeoutMs),
            }));
            if (!response.ok) {
                const err = await this.buildHttpError(response);
                this.breaker.recordFailure(providerKey);
                throw err;
            }
            if (!response.body) {
                throw new Error("No response body for stream");
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() ?? "";
                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith("data:"))
                            continue;
                        const data = trimmed.slice(5).trim();
                        if (data === "[DONE]")
                            return;
                        try {
                            yield JSON.parse(data);
                        }
                        catch (parseErr) {
                            this.logger.warn(`Stream parse error: ${parseErr.message}`);
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
            this.breaker.recordSuccess(providerKey);
            this.logger.debug?.(`STREAM completed in ${Date.now() - startedAt}ms`);
        }
        catch (err) {
            this.breaker.recordFailure(providerKey);
            this.logger.error(`STREAM failed: ${err.message}`);
            throw err;
        }
    }
    async embeddings(model, input) {
        return this.request("POST", litellm_constants_1.LITELLM_ENDPOINTS.EMBEDDINGS, { model, input });
    }
    async generateImages(model, prompt, n = 1, size) {
        return this.request("POST", "/v1/images/generations", { model, prompt, n, size });
    }
    async textToSpeech(model, input, voice) {
        const url = `${this.config.baseUrl}/v1/audio/speech`;
        const response = await this.pool.withConnection(() => fetch(url, {
            method: "POST",
            headers: this.buildHeaders(),
            body: JSON.stringify({ model, input, voice }),
            signal: AbortSignal.timeout(this.config.requestTimeoutMs),
        }));
        if (!response.ok)
            throw await this.buildHttpError(response);
        return response.arrayBuffer();
    }
    async moderate(model, input) {
        return this.request("POST", "/v1/moderations", { model, input });
    }
    async request(method, path, body, timeoutMs) {
        const url = `${this.config.baseUrl}${path}`;
        const timeout = timeoutMs ?? this.config.requestTimeoutMs;
        const startedAt = Date.now();
        const requestId = `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        const logContext = `${method} ${path} [${requestId}]`;
        let attempt = 0;
        let lastError;
        while (attempt <= this.retry.getMaxAttempts()) {
            try {
                this.logger.debug?.(`${logContext} attempt=${attempt + 1}`);
                const result = await this.pool.withConnection(async () => {
                    const response = await fetch(url, {
                        method,
                        headers: this.buildHeaders(),
                        body: body ? JSON.stringify(body) : undefined,
                        signal: AbortSignal.timeout(timeout),
                    });
                    if (!response.ok) {
                        throw await this.buildHttpError(response);
                    }
                    return (await response.json());
                });
                const duration = Date.now() - startedAt;
                this.logger.debug?.(`${logContext} → 200 OK in ${duration}ms`);
                return result;
            }
            catch (err) {
                lastError = err;
                const httpErr = err;
                if (!this.retry.shouldRetry(attempt, err)) {
                    this.logger.error(`${logContext} → ${httpErr.status ?? "ERR"} ${httpErr.message}`);
                    throw err;
                }
                const delay = this.retry.getDelay(attempt);
                this.logger.warn(`${logContext} → ${httpErr.status ?? "ERR"} ${httpErr.message} — retrying in ${delay}ms (attempt ${attempt + 1}/${this.retry.getMaxAttempts()})`);
                await this.sleep(delay);
                attempt++;
            }
        }
        this.logger.error(`${logContext} → exhausted retries`);
        throw lastError;
    }
    buildHeaders(stream = false) {
        const headers = {
            [litellm_constants_1.LITELLM_HEADERS.CONTENT_TYPE]: "application/json",
            [litellm_constants_1.LITELLM_HEADERS.AUTHORIZATION]: `Bearer ${this.config.masterKey}`,
            [litellm_constants_1.LITELLM_HEADERS.USER_AGENT]: "moataz-ai-gateway-backend/3.0",
        };
        if (stream)
            headers[litellm_constants_1.LITELLM_HEADERS.ACCEPT] = "text/event-stream";
        return headers;
    }
    async buildHttpError(response) {
        let body;
        try {
            body = await response.json();
        }
        catch {
            try {
                body = await response.text();
            }
            catch {
                body = undefined;
            }
        }
        let message;
        if (body && typeof body === "object" && "message" in body) {
            message = String(body.message);
        }
        else if (typeof body === "string" && body.length > 0) {
            message = body;
        }
        else {
            message = `HTTP ${response.status} ${response.statusText}`;
        }
        const err = new Error(message);
        err.status = response.status;
        return err;
    }
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
};
exports.LiteLLMClient = LiteLLMClient;
exports.LiteLLMClient = LiteLLMClient = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, litellm_retry_policy_1.LiteLLMRetryPolicy,
        litellm_circuit_breaker_1.LiteLLMCircuitBreaker,
        litellm_connection_pool_1.LiteLLMConnectionPool])
], LiteLLMClient);
//# sourceMappingURL=litellm.client.js.map