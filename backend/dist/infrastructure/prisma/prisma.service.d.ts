import { OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
    softDelete(model: string, id: string): Promise<void>;
}
