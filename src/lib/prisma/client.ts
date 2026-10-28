// ============================================================================
// ShopSphere Prisma Singleton Client (MySQL Transactional Database)
// Experiment 5: Prisma ORM & Connection Management
// Experiment 10: Protected with server-only
// ============================================================================
import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  mysqlAvailable: boolean | undefined;
  lastCheckedAt: number | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Checks whether the MySQL database is reachable with a short timeout
 * so pages and API routes respond quickly even if local MySQL is stopped.
 */
export async function isMySqlConnected(forceRefresh = false): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith("mysql")) {
    return false;
  }

  const now = Date.now();
  if (
    !forceRefresh &&
    typeof globalForPrisma.mysqlAvailable === "boolean" &&
    globalForPrisma.lastCheckedAt &&
    now - globalForPrisma.lastCheckedAt < 10_000
  ) {
    return globalForPrisma.mysqlAvailable;
  }

  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MySQL connection timeout")), 1500)
      ),
    ]);
    globalForPrisma.mysqlAvailable = true;
    globalForPrisma.lastCheckedAt = now;
    return true;
  } catch {
    globalForPrisma.mysqlAvailable = false;
    globalForPrisma.lastCheckedAt = now;
    return false;
  }
}

export default prisma;
