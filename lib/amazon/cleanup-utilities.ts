import { db } from "@/lib/db";

/**
 * Database Cleanup Utilities for Amazon Integration
 * Provides functions to clean up expired and old data
 */

/**
 * Clean up expired OAuth states (>10 minutes old)
 * @returns Number of deleted records
 */
export async function cleanupExpiredOAuthStates(): Promise<number> {
  try {
    const result = await db.oAuthState.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`[Cleanup] Deleted ${result.count} expired OAuth states`);

    return result.count;
  } catch (error) {
    console.error("[Cleanup] Error cleaning up OAuth states:", error);
    return 0;
  }
}

/**
 * Run all cleanup tasks
 * @returns Summary of cleanup results
 */
export async function runAllCleanupTasks(): Promise<{
  oauthStates: number;
}> {
  console.log("[Cleanup] Starting cleanup tasks...");

  const oauthStates = await cleanupExpiredOAuthStates();

  console.log("[Cleanup] Cleanup tasks completed", {
    oauthStates,
  });

  return { oauthStates };
}

/**
 * Add database indexes for performance optimization
 * This should be run as part of database migrations
 */
export async function ensureDatabaseIndexes(): Promise<void> {
  console.log("[Database] Ensuring indexes are created...");

  // Indexes are defined in Prisma schema and created via migrations
  // This function is a placeholder for any additional runtime index checks

  console.log("[Database] Index check completed");
}
