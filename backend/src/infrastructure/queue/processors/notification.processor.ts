import { Injectable, OnModuleInit } from "@nestjs/common";
import { QueueService } from "../queue.service";

/**
 * Processor for async notification delivery (email, push, webhook).
 */
@Injectable()
export class NotificationProcessor implements OnModuleInit {
  constructor(private readonly queue: QueueService) {}

  onModuleInit(): void {
    this.queue.registerQueue("notifications", async (job) => {
      // In production: dispatch to email/push/webhook channels based on job.data.channel
      void job;
    });
  }
}
