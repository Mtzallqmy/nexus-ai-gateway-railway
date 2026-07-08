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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let QueueService = QueueService_1 = class QueueService {
    config;
    logger = new common_1.Logger(QueueService_1.name);
    queues = new Map();
    connection;
    prefix;
    constructor(config) {
        this.config = config;
        this.prefix = this.config.get("app.queue.prefix") ?? "moataz";
    }
    onModuleInit() {
        const host = this.config.get("app.redis.host") ?? "localhost";
        const port = this.config.get("app.redis.port") ?? 6379;
        const password = this.config.get("app.redis.password");
        const db = this.config.get("app.redis.db") ?? 0;
        this.connection = new ioredis_1.default({
            host,
            port,
            password: password || undefined,
            db,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
        this.connection.on("connect", () => this.logger.log("✅ Queue (BullMQ) Redis connected"));
        this.connection.on("error", (err) => this.logger.error(`Queue Redis error: ${err.message}`));
    }
    async onModuleDestroy() {
        for (const [, entry] of this.queues) {
            for (const [, worker] of entry.workers) {
                await worker.close();
            }
            await entry.queue.close();
            entry.events?.close();
        }
        if (this.connection) {
            await this.connection.quit();
            this.logger.log("Queue Redis disconnected");
        }
    }
    registerQueue(name, processor) {
        if (this.queues.has(name)) {
            return this.queues.get(name).queue;
        }
        const queue = new bullmq_1.Queue(name, {
            connection: this.connection.duplicate(),
            prefix: this.prefix,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: 100,
                removeOnFail: 200,
            },
        });
        const entry = { queue, workers: new Map() };
        if (processor) {
            const worker = new bullmq_1.Worker(name, async (job) => {
                try {
                    return await processor({ id: job.id ?? "", data: job.data, name: job.name });
                }
                catch (error) {
                    this.logger.error(`Job ${job.name} failed: ${error.message}`);
                    throw error;
                }
            }, {
                connection: this.connection.duplicate(),
                prefix: this.prefix,
                concurrency: this.config.get("app.queue.concurrency") ?? 5,
            });
            worker.on("completed", (job) => this.logger.debug(`Job ${job.name} completed`));
            worker.on("failed", (job, err) => this.logger.error(`Job ${job?.name ?? "unknown"} failed: ${err.message}`));
            entry.workers.set("default", worker);
            const events = new bullmq_1.QueueEvents(name, {
                connection: this.connection.duplicate(),
                prefix: this.prefix,
            });
            entry.events = events;
        }
        this.queues.set(name, entry);
        this.logger.log(`Queue '${name}' registered${processor ? " with worker" : ""}`);
        return queue;
    }
    async addJob(queueName, jobName, data, opts) {
        const entry = this.queues.get(queueName);
        if (!entry) {
            throw new Error(`Queue '${queueName}' is not registered`);
        }
        await entry.queue.add(jobName, data, {
            delay: opts?.delay,
            priority: opts?.priority,
        });
    }
    async getStats(queueName) {
        const entry = this.queues.get(queueName);
        if (!entry) {
            throw new Error(`Queue '${queueName}' is not registered`);
        }
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            entry.queue.getWaitingCount(),
            entry.queue.getActiveCount(),
            entry.queue.getCompletedCount(),
            entry.queue.getFailedCount(),
            entry.queue.getDelayedCount(),
        ]);
        return { waiting, active, completed, failed, delayed };
    }
    listQueues() {
        return Array.from(this.queues.keys());
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map