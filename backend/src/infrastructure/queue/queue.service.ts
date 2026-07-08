import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

export type JobName = string;
export type QueueName = string;

interface QueueEntry {
  queue: Queue;
  workers: Map<string, Worker>;
  events?: QueueEvents;
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private readonly queues = new Map<QueueName, QueueEntry>();
  private connection!: IORedis;
  private readonly prefix: string;

  constructor(private readonly config: ConfigService) {
    this.prefix = this.config.get<string>("app.queue.prefix") ?? "moataz";
  }

  onModuleInit(): void {
    const host = this.config.get<string>("app.redis.host") ?? "localhost";
    const port = this.config.get<number>("app.redis.port") ?? 6379;
    const password = this.config.get<string>("app.redis.password");
    const db = this.config.get<number>("app.redis.db") ?? 0;

    this.connection = new IORedis({
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

  async onModuleDestroy(): Promise<void> {
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

  /**
   * Register a BullMQ queue with optional worker processor
   */
  registerQueue(
    name: QueueName,
    processor?: (job: { id: string; data: unknown; name: string }) => Promise<unknown>
  ): Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!.queue;
    }

    const queue = new Queue(name, {
      connection: this.connection.duplicate() as never,
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

    const entry: QueueEntry = { queue, workers: new Map() };

    if (processor) {
      const worker = new Worker(
        name,
        async (job) => {
          try {
            return await processor({ id: job.id ?? "", data: job.data, name: job.name });
          } catch (error) {
            this.logger.error(`Job ${job.name} failed: ${(error as Error).message}`);
            throw error;
          }
        },
        {
          connection: this.connection.duplicate() as never,
          prefix: this.prefix,
          concurrency: this.config.get<number>("app.queue.concurrency") ?? 5,
        }
      );
      worker.on("completed", (job) => this.logger.debug(`Job ${job.name} completed`));
      worker.on("failed", (job, err) =>
        this.logger.error(`Job ${job?.name ?? "unknown"} failed: ${err.message}`)
      );
      entry.workers.set("default", worker);

      const events = new QueueEvents(name, {
        connection: this.connection.duplicate() as never,
        prefix: this.prefix,
      });
      entry.events = events;
    }

    this.queues.set(name, entry);
    this.logger.log(`Queue '${name}' registered${processor ? " with worker" : ""}`);
    return queue;
  }

  /**
   * Add a job to a queue
   */
  async addJob<T = unknown>(queueName: QueueName, jobName: JobName, data: T, opts?: { delay?: number; priority?: number }): Promise<void> {
    const entry = this.queues.get(queueName);
    if (!entry) {
      throw new Error(`Queue '${queueName}' is not registered`);
    }
    await entry.queue.add(jobName, data, {
      delay: opts?.delay,
      priority: opts?.priority,
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(queueName: QueueName): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
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

  /**
   * List all registered queue names
   */
  listQueues(): QueueName[] {
    return Array.from(this.queues.keys());
  }
}
