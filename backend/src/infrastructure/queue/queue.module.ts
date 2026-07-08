import { Module, Global } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { AuditLogProcessor } from "./processors/audit-log.processor";
import { NotificationProcessor } from "./processors/notification.processor";

@Global()
@Module({
  providers: [QueueService, AuditLogProcessor, NotificationProcessor],
  exports: [QueueService],
})
export class QueueModule {}
