/**
 * Unified Marketplace Connection Types
 *
 * This module defines all core types for the unified marketplace connection system.
 * These types are used across all marketplace integrations (Amazon, Flipkart, Shopify, etc.)
 */

/**
 * Supported marketplace providers
 */
export type MarketplaceProvider =
  | "amazon"
  | "flipkart"
  | "shopify"
  | "ebay"
  | "etsy";

/**
 * Marketplace connection configuration
 * Contains OAuth credentials and encryption key for a specific marketplace
 */
export interface MarketplaceConnectionConfig {
  /** OAuth client ID */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** OAuth redirect URI for callback */
  redirectUri: string;
  /** Encryption key for token storage */
  encryptionKey: string;
}

/**
 * OAuth token data
 * Contains all token information for a marketplace connection
 */
export interface MarketplaceTokenData {
  /** Short-lived access token for API requests */
  accessToken: string;
  /** Long-lived refresh token for obtaining new access tokens */
  refreshToken: string;
  /** Expiration timestamp for access token */
  accessTokenExpiresAt: Date;
  /** Expiration timestamp for refresh token */
  refreshTokenExpiresAt: Date;
  /** Unique identifier for the seller account */
  sellerId: string;
}

/**
 * Connection status
 * Represents the current state of a marketplace connection
 */
export interface MarketplaceConnectionStatus {
  /** Whether the marketplace is currently connected */
  connected: boolean;
  /** The marketplace provider */
  provider: MarketplaceProvider;
  /** Seller ID (only present when connected) */
  sellerId?: string;
  /** Marketplace ID (only present when connected, e.g., "ATVPDKIKX0DER" for Amazon US) */
  marketplaceId?: string;
  /** Connection timestamp (only present when connected) */
  connectedAt?: Date;
}

/**
 * OAuth endpoints
 * Platform-specific OAuth URLs
 */
export interface MarketplaceOAuthEndpoints {
  /** Authorization endpoint URL */
  authorization: string;
  /** Token exchange endpoint URL */
  token: string;
}

/**
 * Marketplace metadata
 * Platform-specific information and configuration
 */
export interface MarketplaceMetadata {
  /** Internal name (e.g., "amazon") */
  name: string;
  /** Display name for UI (e.g., "Amazon") */
  displayName: string;
  /** Country code (e.g., "US", "IN") */
  countryCode?: string;
  /** API endpoint base URL */
  apiEndpoint?: string;
}

/**
 * OAuth flow result
 * Data returned after successful OAuth authorization
 */
export interface OAuthFlowResult {
  /** Seller ID extracted from token response */
  sellerId: string;
  /** User ID who initiated the connection */
  userId: string;
  /** Marketplace ID (e.g., "ATVPDKIKX0DER" for Amazon US) */
  marketplaceId: string;
  /** OAuth tokens */
  tokens: {
    /** Access token */
    accessToken: string;
    /** Refresh token */
    refreshToken: string;
    /** Access token expiration in seconds */
    expiresIn: number;
    /** Refresh token expiration in seconds (optional) */
    refreshTokenExpiresIn?: number;
  };
}

/**
 * Token refresh result
 * Data returned after refreshing an access token
 */
export interface TokenRefreshResult {
  /** New access token */
  accessToken: string;
  /** Expiration time in seconds */
  expiresIn: number;
}
