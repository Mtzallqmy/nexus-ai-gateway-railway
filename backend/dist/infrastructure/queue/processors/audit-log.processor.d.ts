import { OnModuleInit } from "@nestjs/common";
import { QueueService } from "../queue.service";
export declare class AuditLogProcessor implements OnModuleInit {
    private readonly queue;
    constructor(queue: QueueService);
    onModuleInit(): void;
}
