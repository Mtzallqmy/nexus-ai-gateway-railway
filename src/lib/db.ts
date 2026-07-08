import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var moatazPrisma: PrismaClient | undefined;
}

export const prisma = globalThis.moatazPrisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalThis.moatazPrisma = prisma;
}
