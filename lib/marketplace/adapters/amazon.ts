/**
 * Amazon Marketplace Adapter
 *
 * Implements the MarketplaceAdapter interface for Amazon Seller Central / SP-API.
 * Handles Amazon-specific OAuth configuration and token response parsing.
 */

import type {
  MarketplaceConnectionConfig,
  MarketplaceMetadata,
  MarketplaceOAuthEndpoints,
} from "@/types/marketplace";
import type { MarketplaceAdapter } from "../types";

/**
 * Amazon OAuth endpoints
 */
const AMAZON_OAUTH_ENDPOINTS = {
  authorization: "https://sellercentral.amazon.com/apps/authorize/consent",
  token: "https://api.amazon.com/auth/o2/token",
} as const;

/**
 * Amazon Marketplace Adapter
 *
 * Provides Amazon-specific implementation of the marketplace adapter interface.
 */
export class AmazonAdapter implements MarketplaceAdapter {
  /**
   * Get Amazon OAuth endpoints
   *
   * @returns Amazon authorization and token URLs
   */
  getOAuthEndpoints(): MarketplaceOAuthEndpoints {
    return {
      authorization: AMAZON_OAUTH_ENDPOINTS.authorization,
      token: AMAZON_OAUTH_ENDPOINTS.token,
    };
  }

  /**
   * Get Amazon OAuth configuration from environment variables
   *
   * Required environment variables:
   * - AMAZON_CLIENT_ID: Amazon LWA application ID
   * - AMAZON_CLIENT_SECRET: Amazon LWA application secret
   * - AMAZON_REDIRECT_URI: OAuth callback URL
   * - AMAZON_ENCRYPTION_KEY: Token encryption key
   *
   * @returns Amazon OAuth configuration
   * @throws Error if required environment variables are missing
   */
  getOAuthConfig(): MarketplaceConnectionConfig {
    const clientId = process.env.AMAZON_CLIENT_ID;
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;
    const redirectUri = process.env.AMAZON_REDIRECT_URI;
    const encryptionKey = process.env.AMAZON_ENCRYPTION_KEY;

    if (!clientId || !clientSecret || !redirectUri || !encryptionKey) {
      const missing = [];
      if (!clientId) missing.push("AMAZON_CLIENT_ID");
      if (!clientSecret) missing.push("AMAZON_CLIENT_SECRET");
      if (!redirectUri) missing.push("AMAZON_REDIRECT_URI");
      if (!encryptionKey) missing.push("AMAZON_ENCRYPTION_KEY");

      throw new Error(
        `Amazon OAuth configuration missing: ${missing.join(", ")}. Please set these environment variables.`,
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
   * Get Amazon marketplace metadata
   *
   * @returns Amazon marketplace information
   */
  getMarketplaceMetadata(): MarketplaceMetadata {
    return {
      name: "amazon",
      displayName: "Amazon",
      countryCode: "US",
      apiEndpoint: "https://sellingpartnerapi-na.amazon.com",
    };
  }

  /**
   * Extract seller ID from Amazon token response
   *
   * Amazon returns seller ID in the token response or requires a separate API call.
   * The seller ID may be in different fields depending on the OAuth flow.
   *
   * @param data - Amazon token response data
   * @returns Extracted seller ID
   * @throws Error if seller ID cannot be extracted
   */
  extractSellerIdFromTokenResponse(data: any): string {
    // Amazon may return seller_id directly in token response
    if (data.seller_id) {
      return data.seller_id;
    }

    // Or in selling_partner_id field
    if (data.selling_partner_id) {
      return data.selling_partner_id;
    }

    // If not present, we'll need to fetch it from the profile API
    // For now, throw an error indicating additional API call is needed
    throw new Error(
      "Seller ID not found in token response. Additional API call required to fetch seller profile.",
    );
  }
}
