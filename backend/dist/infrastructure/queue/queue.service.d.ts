import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
export type JobName = string;
export type QueueName = string;
export declare class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly queues;
    private connection;
    private readonly prefix;
    constructor(config: ConfigService);
    onModuleInit(): void;
    onModuleDestroy(): Promise<void>;
    registerQueue(name: QueueName, processor?: (job: {
        id: string;
        data: unknown;
        name: string;
    }) => Promise<unknown>): Queue;
    addJob<T = unknown>(queueName: QueueName, jobName: JobName, data: T, opts?: {
        delay?: number;
        priority?: number;
    }): Promise<void>;
    getStats(queueName: QueueName): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
    listQueues(): QueueName[];
}
