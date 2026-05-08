/**
 * Marketplace Platform Adapter Types
 *
 * This module defines the adapter interface that all marketplace platforms must implement.
 * The adapter pattern allows for consistent OAuth flows while supporting platform-specific behavior.
 */

import type {
  MarketplaceConnectionConfig,
  MarketplaceMetadata,
  MarketplaceOAuthEndpoints,
} from "@/types/marketplace";

/**
 * Platform Adapter Interface
 *
 * Each marketplace platform (Amazon, Flipkart, Shopify, etc.) implements this interface
 * to provide platform-specific OAuth configuration and behavior.
 *
 * The adapter pattern enables:
 * - Consistent OAuth flow across all platforms
 * - Platform-specific endpoint and configuration management
 * - Easy addition of new marketplace platforms
 * - Centralized token response parsing
 *
 * @example
 * ```typescript
 * class AmazonAdapter implements MarketplaceAdapter {
 *   getOAuthEndpoints() {
 *     return {
 *       authorization: "https://sellercentral.amazon.com/apps/authorize/consent",
 *       token: "https://api.amazon.com/auth/o2/token"
 *     };
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export interface MarketplaceAdapter {
  /**
   * Get OAuth endpoints for this marketplace
   *
   * Returns the authorization and token exchange URLs specific to this platform.
   *
   * @returns OAuth endpoint URLs
   *
   * @example
   * ```typescript
   * const endpoints = adapter.getOAuthEndpoints();
   * // { authorization: "https://...", token: "https://..." }
   * ```
   */
  getOAuthEndpoints(): MarketplaceOAuthEndpoints;

  /**
   * Get OAuth configuration from environment variables
   *
   * Reads platform-specific OAuth credentials from environment variables.
   * Expected environment variables:
   * - {PROVIDER}_CLIENT_ID
   * - {PROVIDER}_CLIENT_SECRET
   * - {PROVIDER}_REDIRECT_URI
   * - {PROVIDER}_ENCRYPTION_KEY
   *
   * @returns OAuth configuration
   * @throws Error if required environment variables are missing
   *
   * @example
   * ```typescript
   * const config = adapter.getOAuthConfig();
   * // { clientId: "...", clientSecret: "...", redirectUri: "...", encryptionKey: "..." }
   * ```
   */
  getOAuthConfig(): MarketplaceConnectionConfig;

  /**
   * Get marketplace metadata
   *
   * Returns platform-specific metadata such as display name, country code, and API endpoint.
   *
   * @returns Marketplace metadata
   *
   * @example
   * ```typescript
   * const metadata = adapter.getMarketplaceMetadata();
   * // { name: "amazon", displayName: "Amazon", countryCode: "US", apiEndpoint: "https://..." }
   * ```
   */
  getMarketplaceMetadata(): MarketplaceMetadata;

  /**
   * Extract seller ID from OAuth token response
   *
   * Different platforms return seller ID in different formats and locations.
   * This method normalizes the extraction process.
   *
   * @param data - The raw token response data from the OAuth provider
   * @returns The extracted seller ID
   * @throws Error if seller ID cannot be extracted
   *
   * @example
   * ```typescript
   * const tokenResponse = { seller_id: "A1B2C3D4E5", access_token: "..." };
   * const sellerId = adapter.extractSellerIdFromTokenResponse(tokenResponse);
   * // Returns: "A1B2C3D4E5"
   * ```
   */
  extractSellerIdFromTokenResponse(data: any): string;
}
