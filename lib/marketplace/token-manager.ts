/**
 * Unified Marketplace Token Manager
 *
 * This module manages the lifecycle of OAuth tokens for all marketplace platforms.
 * It handles token storage, retrieval, automatic refresh, and revocation.
 */

import type {
  MarketplaceConnectionStatus,
  MarketplaceProvider,
} from "@/types/marketplace";
import { db } from "@/lib/db";
import { encryptToken, decryptToken } from "./encryption";
import { refreshAccessToken } from "./oauth";

/**
 * Token refresh threshold (5 minutes)
 * Tokens will be refreshed if they expire in less than this time
 */
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Custom error for expired tokens
 */
export class TokenExpiredError extends Error {
  constructor(provider: MarketplaceProvider) {
    super(
      `Token expired for ${provider}. Please reconnect your marketplace account.`,
    );
    this.name = "TokenExpiredError";
  }
}

/**
 * Store encrypted tokens in database
 *
 * Creates or updates a marketplace connection with encrypted tokens.
 * Uses upsert to handle both new connections and token updates.
 *
 * @param userId - The user ID
 * @param provider - The marketplace provider
 * @param tokens - OAuth tokens (access token, refresh token, expiration times)
 * @param sellerId - The seller ID from the marketplace
 * @param marketplaceId - The marketplace ID
 * @throws Error if encryption or database operation fails
 *
 * @example
 * ```typescript
 * await storeTokens("user123", "amazon", {
 *   accessToken: "access_123",
 *   refreshToken: "refresh_123",
 *   expiresIn: 3600,
 *   refreshTokenExpiresIn: 31536000
 * }, "seller123", "ATVPDKIKX0DER");
 * ```
 */
export async function storeTokens(
  userId: string,
  provider: MarketplaceProvider,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshTokenExpiresIn?: number;
  },
  sellerId: string,
  marketplaceId: string,
): Promise<void> {
  // Encrypt tokens
  const encryptedAccessToken = encryptToken(tokens.accessToken, provider);
  const encryptedRefreshToken = encryptToken(tokens.refreshToken, provider);

  // Calculate expiration timestamps
  const accessTokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
  const refreshTokenExpiresAt = new Date(
    Date.now() + (tokens.refreshTokenExpiresIn || 365 * 24 * 60 * 60) * 1000, // Default 1 year
  );

  // Upsert connection (create or update)
  await db.marketplaceConnection.upsert({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase() as any,
      },
    },
    create: {
      userId,
      provider: provider.toUpperCase() as any,
      sellerId,
      marketplaceId,
      encryptedAccessToken,
      encryptedRefreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    },
    update: {
      sellerId,
      marketplaceId,
      encryptedAccessToken,
      encryptedRefreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    },
  });
}

/**
 * Get valid access token (auto-refreshes if needed)
 *
 * Retrieves the access token for a marketplace connection.
 * Automatically refreshes the token if it expires in less than 5 minutes.
 *
 * @param userId - The user ID
 * @param provider - The marketplace provider
 * @returns Valid access token
 * @throws TokenExpiredError if token refresh fails
 * @throws Error if connection not found
 *
 * @example
 * ```typescript
 * const accessToken = await getValidAccessToken("user123", "amazon");
 * // Use accessToken for API requests
 * ```
 */
export async function getValidAccessToken(
  userId: string,
  provider: MarketplaceProvider,
): Promise<string> {
  // Retrieve connection from database
  const connection = await db.marketplaceConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase() as any,
      },
    },
  });

  if (!connection) {
    throw new Error(
      `No ${provider} connection found for user. Please connect your marketplace account.`,
    );
  }

  const now = new Date();
  const timeUntilExpiration =
    connection.accessTokenExpiresAt.getTime() - now.getTime();

  // If token expires in more than 5 minutes, return it
  if (timeUntilExpiration > REFRESH_THRESHOLD_MS) {
    return decryptToken(connection.encryptedAccessToken, provider);
  }

  // Token expires soon, refresh it
  try {
    const decryptedRefreshToken = decryptToken(
      connection.encryptedRefreshToken,
      provider,
    );
    const refreshResult = await refreshAccessToken(
      decryptedRefreshToken,
      provider,
    );

    // Encrypt new access token
    const encryptedAccessToken = encryptToken(
      refreshResult.accessToken,
      provider,
    );
    const accessTokenExpiresAt = new Date(
      Date.now() + refreshResult.expiresIn * 1000,
    );

    // Update database with new token
    await db.marketplaceConnection.update({
      where: {
        userId_provider: {
          userId,
          provider: provider.toUpperCase() as any,
        },
      },
      data: {
        encryptedAccessToken,
        accessTokenExpiresAt,
      },
    });

    return refreshResult.accessToken;
  } catch (error) {
    throw new TokenExpiredError(provider);
  }
}

/**
 * Revoke marketplace connection
 *
 * Deletes the marketplace connection from the database.
 * This removes all stored tokens and connection data.
 *
 * @param userId - The user ID
 * @param provider - The marketplace provider
 * @throws Error if connection not found or deletion fails
 *
 * @example
 * ```typescript
 * await revokeConnection("user123", "amazon");
 * ```
 */
export async function revokeConnection(
  userId: string,
  provider: MarketplaceProvider,
): Promise<void> {
  await db.marketplaceConnection.delete({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase() as any,
      },
    },
  });
}

/**
 * Get connection status
 *
 * Returns the current status of a marketplace connection.
 *
 * @param userId - The user ID
 * @param provider - The marketplace provider
 * @returns Connection status (connected, seller ID, connected date)
 *
 * @example
 * ```typescript
 * const status = await getConnectionStatus("user123", "amazon");
 * if (status.connected) {
 *   console.log(`Connected as seller ${status.sellerId}`);
 * }
 * ```
 */
export async function getConnectionStatus(
  userId: string,
  provider: MarketplaceProvider,
): Promise<MarketplaceConnectionStatus> {
  const connection = await db.marketplaceConnection.findUnique({
    where: {
      userId_provider: {
        userId,
        provider: provider.toUpperCase() as any,
      },
    },
  });

  if (!connection) {
    return {
      connected: false,
      provider,
    };
  }

  return {
    connected: true,
    provider,
    sellerId: connection.sellerId,
    marketplaceId: connection.marketplaceId,
    connectedAt: connection.createdAt,
  };
}
