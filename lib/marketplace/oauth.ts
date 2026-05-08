/**
 * Unified Marketplace OAuth Manager
 *
 * This module handles OAuth 2.0 authorization flows for all marketplace platforms.
 * It provides a consistent interface for generating authorization URLs, handling callbacks,
 * and refreshing access tokens across different marketplaces.
 */

import crypto from "node:crypto";
import type {
  MarketplaceProvider,
  OAuthFlowResult,
  TokenRefreshResult,
} from "@/types/marketplace";
import { db } from "@/lib/db";
import { getAdapter } from "./adapter-registry";

/**
 * OAuth state configuration
 */
const STATE_LENGTH = 32; // bytes (64 hex characters)
const STATE_EXPIRATION_MINUTES = 10;

/**
 * Token refresh configuration
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in milliseconds

/**
 * Generate OAuth authorization URL
 *
 * Creates a platform-specific authorization URL with a secure state parameter for CSRF protection.
 * The state parameter is stored in the database with a 10-minute expiration.
 *
 * @param userId - The user ID initiating the connection
 * @param provider - The marketplace provider
 * @param marketplaceId - Optional marketplace ID (e.g., "ATVPDKIKX0DER" for Amazon US)
 * @returns Authorization URL and state parameter
 * @throws Error if adapter or configuration is missing
 *
 * @example
 * ```typescript
 * const { url, state } = await generateAuthorizationUrl("user123", "amazon", "ATVPDKIKX0DER");
 * // Redirect user to url
 * ```
 */
export async function generateAuthorizationUrl(
  userId: string,
  provider: MarketplaceProvider,
  marketplaceId?: string,
): Promise<{ url: string; state: string }> {
  // Get platform adapter
  const adapter = getAdapter(provider);
  const endpoints = adapter.getOAuthEndpoints();
  const config = adapter.getOAuthConfig();

  // Generate secure random state parameter
  const state = crypto.randomBytes(STATE_LENGTH).toString("hex");

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + STATE_EXPIRATION_MINUTES * 60 * 1000);

  // Store state in database
  await db.oAuthState.create({
    data: {
      state,
      userId,
      marketplaceId: marketplaceId || provider,
      expiresAt,
    },
  });

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    state,
  });

  // Add marketplace-specific parameters
  if (provider === "amazon") {
    params.append("scope", "sellingpartnerapi::migration");
    if (marketplaceId) {
      params.append("marketplace_id", marketplaceId);
    }
  } else if (provider === "flipkart") {
    params.append("scope", "Seller_Api");
  }

  const url = `${endpoints.authorization}?${params.toString()}`;

  return { url, state };
}

/**
 * Handle OAuth callback
 *
 * Validates the state parameter, exchanges the authorization code for tokens,
 * and extracts the seller ID from the token response.
 *
 * @param code - Authorization code from OAuth provider
 * @param state - State parameter for CSRF validation
 * @param provider - The marketplace provider
 * @returns OAuth flow result with tokens and seller ID
 * @throws Error if state is invalid, expired, or token exchange fails
 *
 * @example
 * ```typescript
 * const result = await handleCallback("auth_code_123", "state_abc", "amazon");
 * // result.tokens contains access_token, refresh_token, etc.
 * ```
 */
export async function handleCallback(
  code: string,
  state: string,
  provider: MarketplaceProvider,
): Promise<OAuthFlowResult> {
  // Validate state parameter
  const stateRecord = await db.oAuthState.findUnique({
    where: { state },
  });

  if (!stateRecord) {
    throw new Error(
      "Invalid state parameter. OAuth flow may have been tampered with.",
    );
  }

  if (stateRecord.expiresAt < new Date()) {
    // Delete expired state
    await db.oAuthState.delete({ where: { state } });
    throw new Error("State parameter expired. Please try connecting again.");
  }

  // Delete state after validation (one-time use)
  await db.oAuthState.delete({ where: { state } });

  // Get platform adapter
  const adapter = getAdapter(provider);
  const endpoints = adapter.getOAuthEndpoints();
  const config = adapter.getOAuthConfig();

  // Exchange authorization code for tokens
  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  });

  const tokenResponse = await fetch(endpoints.token, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(
      `Token exchange failed: ${tokenResponse.status} ${errorText}`,
    );
  }

  const tokenData = await tokenResponse.json();

  // Extract seller ID using adapter
  const sellerId = adapter.extractSellerIdFromTokenResponse(tokenData);

  // Return OAuth flow result
  return {
    sellerId,
    userId: stateRecord.userId,
    marketplaceId: stateRecord.marketplaceId,
    tokens: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      refreshTokenExpiresIn: tokenData.refresh_token_expires_in,
    },
  };
}

/**
 * Refresh access token
 *
 * Requests a new access token using the refresh token.
 * Implements exponential backoff retry logic for network failures.
 *
 * @param refreshToken - The refresh token
 * @param provider - The marketplace provider
 * @returns New access token and expiration time
 * @throws Error if refresh fails after max retries
 *
 * @example
 * ```typescript
 * const result = await refreshAccessToken("refresh_token_123", "amazon");
 * // result.accessToken contains the new access token
 * ```
 */
export async function refreshAccessToken(
  refreshToken: string,
  provider: MarketplaceProvider,
): Promise<TokenRefreshResult> {
  // Get platform adapter
  const adapter = getAdapter(provider);
  const endpoints = adapter.getOAuthEndpoints();
  const config = adapter.getOAuthConfig();

  let lastError: Error | null = null;

  // Retry with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      });

      const tokenResponse = await fetch(endpoints.token, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenParams.toString(),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        throw new Error(
          `Token refresh failed: ${tokenResponse.status} ${errorText}`,
        );
      }

      const tokenData = await tokenResponse.json();

      return {
        accessToken: tokenData.access_token,
        expiresIn: tokenData.expires_in,
      };
    } catch (error) {
      lastError = error as Error;

      // If not the last attempt, wait before retrying
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[attempt]),
        );
      }
    }
  }

  // All retries failed
  throw new Error(
    `Token refresh failed after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
}
