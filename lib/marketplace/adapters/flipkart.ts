/**
 * Flipkart Marketplace Adapter
 *
 * Implements the MarketplaceAdapter interface for Flipkart Seller Hub.
 * Handles Flipkart-specific OAuth configuration and token response parsing.
 */

import type {
  MarketplaceConnectionConfig,
  MarketplaceMetadata,
  MarketplaceOAuthEndpoints,
} from "@/types/marketplace";
import type { MarketplaceAdapter } from "../types";

/**
 * Flipkart OAuth endpoints
 */
const FLIPKART_OAUTH_ENDPOINTS = {
  authorization: "https://api.flipkart.net/oauth-service/oauth/authorize",
  token: "https://api.flipkart.net/oauth-service/oauth/token",
} as const;

/**
 * Flipkart Marketplace Adapter
 *
 * Provides Flipkart-specific implementation of the marketplace adapter interface.
 */
export class FlipkartAdapter implements MarketplaceAdapter {
  /**
   * Get Flipkart OAuth endpoints
   *
   * @returns Flipkart authorization and token URLs
   */
  getOAuthEndpoints(): MarketplaceOAuthEndpoints {
    return {
      authorization: FLIPKART_OAUTH_ENDPOINTS.authorization,
      token: FLIPKART_OAUTH_ENDPOINTS.token,
    };
  }

  /**
   * Get Flipkart OAuth configuration from environment variables
   *
   * Required environment variables:
   * - FLIPKART_CLIENT_ID: Flipkart application ID
   * - FLIPKART_CLIENT_SECRET: Flipkart application secret
   * - FLIPKART_REDIRECT_URI: OAuth callback URL
   * - FLIPKART_ENCRYPTION_KEY: Token encryption key
   *
   * @returns Flipkart OAuth configuration
   * @throws Error if required environment variables are missing
   */
  getOAuthConfig(): MarketplaceConnectionConfig {
    const clientId = process.env.FLIPKART_CLIENT_ID;
    const clientSecret = process.env.FLIPKART_CLIENT_SECRET;
    const redirectUri = process.env.FLIPKART_REDIRECT_URI;
    const encryptionKey = process.env.FLIPKART_ENCRYPTION_KEY;

    if (!clientId || !clientSecret || !redirectUri || !encryptionKey) {
      const missing = [];
      if (!clientId) missing.push("FLIPKART_CLIENT_ID");
      if (!clientSecret) missing.push("FLIPKART_CLIENT_SECRET");
      if (!redirectUri) missing.push("FLIPKART_REDIRECT_URI");
      if (!encryptionKey) missing.push("FLIPKART_ENCRYPTION_KEY");

      throw new Error(
        `Flipkart OAuth configuration missing: ${missing.join(", ")}. Please set these environment variables.`,
      );
    }

    return {
      clientId,
      clientSecret,
      redirectUri,
      encryptionKey,
    };
  }

  /**
   * Get Flipkart marketplace metadata
   *
   * @returns Flipkart marketplace information
   */
  getMarketplaceMetadata(): MarketplaceMetadata {
    return {
      name: "flipkart",
      displayName: "Flipkart",
      countryCode: "IN",
      apiEndpoint: "https://api.flipkart.net",
    };
  }

  /**
   * Extract seller ID from Flipkart token response
   *
   * Flipkart returns seller ID in the token response.
   *
   * @param data - Flipkart token response data
   * @returns Extracted seller ID
   * @throws Error if seller ID cannot be extracted
   */
  extractSellerIdFromTokenResponse(data: any): string {
    // Flipkart returns seller_id in token response
    if (data.seller_id) {
      return data.seller_id;
    }

    // Alternative field name
    if (data.sellerId) {
      return data.sellerId;
    }

    // If not present, throw error
    throw new Error(
      "Seller ID not found in Flipkart token response. Response may be malformed.",
    );
  }
}
