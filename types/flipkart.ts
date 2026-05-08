/**
 * Flipkart Seller Integration Types
 * Type definitions for Flipkart OAuth 2.0 integration
 *
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please migrate to the unified marketplace types in `types/marketplace.ts`.
 *
 * Migration guide:
 * - Use `MarketplaceProvider` type with value "flipkart" instead of Flipkart-specific types
 * - Use `MarketplaceConnectionConfig` instead of `FlipkartOAuthConfig`
 * - Use `MarketplaceTokenData` instead of `FlipkartTokenData`
 * - Use `MarketplaceConnectionStatus` instead of `FlipkartConnectionStatus`
 * - Import from `types/marketplace.ts` instead of `types/flipkart.ts`
 */

/**
 * Flipkart OAuth configuration
 * Environment variables required for OAuth flow
 */
export interface FlipkartOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  encryptionKey: string;
}

/**
 * Flipkart OAuth token data
 * Stored in database after successful OAuth flow
 */
export interface FlipkartTokenData {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  sellerId: string;
}

/**
 * Flipkart connection status
 * Returned when checking user's connection state
 */
export interface FlipkartConnectionStatus {
  connected: boolean;
  sellerId?: string;
  connectedAt?: Date;
}

/**
 * Flipkart OAuth API response
 * Response structure from token exchange endpoint
 */
export interface FlipkartOAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  token_type: string;
  seller_id?: string; // May or may not be present
}

/**
 * Flipkart OAuth endpoint constants
 */
export const FLIPKART_OAUTH_ENDPOINTS = {
  AUTHORIZATION: "https://api.flipkart.net/oauth-service/oauth/authorize",
  TOKEN: "https://api.flipkart.net/oauth-service/oauth/token",
} as const;

/**
 * Flipkart OAuth scope
 */
export const FLIPKART_OAUTH_SCOPE = "Seller_Api" as const;

/**
 * Flipkart API error codes
 */
export const FLIPKART_ERROR_CODES = {
  INVALID_GRANT: "invalid_grant",
  INVALID_CLIENT: "invalid_client",
  INVALID_REQUEST: "invalid_request",
  UNAUTHORIZED_CLIENT: "unauthorized_client",
  UNSUPPORTED_GRANT_TYPE: "unsupported_grant_type",
  INVALID_SCOPE: "invalid_scope",
  TOKEN_EXPIRED: "token_expired",
  NETWORK_ERROR: "network_error",
  INVALID_STATE: "invalid_state",
  CONFIG_MISSING: "config_missing",
  UNKNOWN_ERROR: "unknown_error",
} as const;

/**
 * User-facing error messages
 * Displayed to users when errors occur during OAuth flow
 */
export const FLIPKART_ERROR_MESSAGES = {
  TOKEN_EXPIRED: "Flipkart connection expired. Please reconnect your account.",
  INVALID_STATE: "Security validation failed. Please try connecting again.",
  NETWORK_ERROR:
    "Unable to reach Flipkart. Please check your internet connection and try again.",
  AUTH_FAILED: "Failed to connect Flipkart account. Please try again.",
  SUBSCRIPTION_REQUIRED: "Upgrade to Pro to connect marketplaces.",
  CONFIG_MISSING:
    "Flipkart integration is not configured. Please contact support.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  CONNECTION_NOT_FOUND:
    "Flipkart connection not found. Please connect your account in Settings.",
  DISCONNECT_FAILED: "Failed to disconnect Flipkart account. Please try again.",
} as const;

/**
 * OAuth state parameter configuration
 */
export const OAUTH_STATE_CONFIG = {
  LENGTH: 32, // bytes (64 hex characters)
  EXPIRATION_MINUTES: 10,
} as const;

/**
 * Token refresh configuration
 */
export const TOKEN_REFRESH_CONFIG = {
  THRESHOLD_MINUTES: 5, // Refresh when less than 5 minutes remaining
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // Exponential backoff in milliseconds
} as const;
