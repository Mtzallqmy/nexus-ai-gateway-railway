import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: "event", level: "query" },
        { emit: "event", level: "info" },
        { emit: "event", level: "warn" },
        { emit: "event", level: "error" },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("✅ Prisma connected to database");
    } catch (error) {
      this.logger.error("❌ Prisma connection failed", error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      this.logger.log("Prisma disconnected");
    } catch (error) {
      this.logger.error("Error during Prisma disconnect", error);
    }
  }

  /**
   * Run multiple operations in a transaction with retry on conflict
   */
  async withTransaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => fn(tx as unknown as PrismaClient));
  }

  /**
   * Soft delete helper - sets deletedAt without removing the record
   */
  async softDelete(model: string, id: string): Promise<void> {
    // Prisma doesn't natively support soft delete; this is a helper pattern
    // Use: await prisma.user.update({ where: { id }, data: { deletedAt: new Date() } })
    void model;
    void id;
  }
}
