import { Injectable, OnModuleInit } from "@nestjs/common";
import { QueueService } from "../queue.service";

/**
 * Processor for async audit log writes — keeps API responses fast
 * by offloading audit persistence to a background queue.
 */
@Injectable()
export class AuditLogProcessor implements OnModuleInit {
  constructor(private readonly queue: QueueService) {}

  onModuleInit(): void {
    this.queue.registerQueue("audit-logs", async (job) => {
      // In production: prisma.auditLog.create({ data: job.data })
      void job;
    });
  }
}
