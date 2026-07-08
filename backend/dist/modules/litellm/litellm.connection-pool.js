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
exports.LiteLLMConnectionPool = void 0;
const common_1 = require("@nestjs/common");
const litellm_constants_1 = require("./litellm.constants");
let LiteLLMConnectionPool = class LiteLLMConnectionPool {
    logger = new common_1.Logger(litellm_constants_1.LITELLM_LOG_CONTEXTS.POOL);
    max;
    active = 0;
    idle = 0;
    waiting = 0;
    nextId = 1;
    waiters = [];
    constructor(max = 50) {
        this.max = max;
        this.idle = max;
    }
    async acquire() {
        if (this.active < this.max) {
            this.active++;
            this.idle = this.max - this.active;
            const entry = { id: this.nextId++, acquiredAt: Date.now() };
            this.logger.debug?.(`Acquired connection #${entry.id} (active=${this.active})`);
            return entry;
        }
        this.waiting++;
        this.logger.debug?.(`Waiting for connection (waiting=${this.waiting})`);
        return new Promise((resolve) => {
            this.waiters.push((entry) => {
                this.waiting--;
                resolve(entry);
            });
        });
    }
    release(entry) {
        const duration = Date.now() - entry.acquiredAt;
        this.active--;
        this.idle = this.max - this.active;
        this.logger.debug?.(`Released connection #${entry.id} (held ${duration}ms, active=${this.active})`);
        const next = this.waiters.shift();
        if (next) {
            this.active++;
            this.idle = this.max - this.active;
            next({ id: this.nextId++, acquiredAt: Date.now() });
        }
    }
    getStats() {
        return { active: this.active, idle: this.idle, max: this.max, waiting: this.waiting };
    }
    async withConnection(fn) {
        const entry = await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release(entry);
        }
    }
};
exports.LiteLLMConnectionPool = LiteLLMConnectionPool;
exports.LiteLLMConnectionPool = LiteLLMConnectionPool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], LiteLLMConnectionPool);
//# sourceMappingURL=litellm.connection-pool.js.map