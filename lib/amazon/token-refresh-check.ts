import { db } from "@/lib/db";
import { getValidAccessToken } from "@/lib/marketplace/token-manager";

/**
 * Background Token Refresh Check
 * Utility to check and refresh tokens that are expiring soon
 */

const TOKEN_REFRESH_THRESHOLD_MINUTES = 5;

/**
 * Check all Amazon connections and refresh tokens that are expiring soon
 * This should be called on app startup or periodically
 */
export async function checkAndRefreshExpiringTokens(): Promise<{
  checked: number;
  refreshed: number;
  failed: number;
}> {
  let checked = 0;
  let refreshed = 0;
  let failed = 0;

  try {
    // Get all Amazon connections
    const connections = await db.marketplaceConnection.findMany({
      where: { provider: "AMAZON" },
    });
    checked = connections.length;

    for (const connection of connections) {
      const now = new Date();
      const expiresAt = new Date(connection.accessTokenExpiresAt);
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);

      // If token is expiring within threshold, refresh it
      if (minutesUntilExpiry <= TOKEN_REFRESH_THRESHOLD_MINUTES) {
        try {
          await getValidAccessToken(connection.userId, "amazon");
          refreshed++;
          console.log(
            `[Token Refresh] Successfully refreshed token for user ${connection.userId}`,
          );
        } catch (error) {
          failed++;
          console.error(
            `[Token Refresh] Failed to refresh token for user ${connection.userId}:`,
            error,
          );
        }
      }
    }

    console.log(
      `[Token Refresh] Checked ${checked} connections, refreshed ${refreshed}, failed ${failed}`,
    );
  } catch (error) {
    console.error("[Token Refresh] Error checking tokens:", error);
  }

  return { checked, refreshed, failed };
}

/**
 * Log token refresh attempt
 */
export function logTokenRefresh(
  userId: string,
  success: boolean,
  error?: string,
): void {
  const timestamp = new Date().toISOString();
  const status = success ? "SUCCESS" : "FAILED";
  const errorMsg = error ? ` - ${error}` : "";

  console.log(
    `[${timestamp}] Token Refresh ${status} for user ${userId}${errorMsg}`,
  );
}
