/**
 * Amazon Seller Integration Types
 * Type definitions for Amazon SP-API integration
 *
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please migrate to the unified marketplace types in `types/marketplace.ts`.
 *
 * Migration guide:
 * - Use `MarketplaceProvider` type with value "amazon" instead of Amazon-specific types
 * - Use `MarketplaceConnectionConfig` instead of separate config interfaces
 * - Use `MarketplaceTokenData` instead of `TokenData`
 * - Use `MarketplaceConnectionStatus` instead of `ConnectionStatus`
 * - Import from `types/marketplace.ts` instead of `types/amazon.ts`
 */

/**
 * Amazon marketplace configuration
 */
export interface AmazonMarketplace {
  id: string;
  name: string;
  countryCode: string;
  endpoint: string;
}

/**
 * Amazon marketplace constants
 */
export const AMAZON_MARKETPLACES: Record<string, AmazonMarketplace> = {
  US: {
    id: "ATVPDKIKX0DER",
    name: "United States",
    countryCode: "US",
    endpoint: "https://sellingpartnerapi-na.amazon.com",
  },
  UK: {
    id: "A1F83G8C2ARO7P",
    name: "United Kingdom",
    countryCode: "GB",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  IN: {
    id: "A21TJRUUN4KGV",
    name: "India",
    countryCode: "IN",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  CA: {
    id: "A2EUQ1WTGCTBG2",
    name: "Canada",
    countryCode: "CA",
    endpoint: "https://sellingpartnerapi-na.amazon.com",
  },
  DE: {
    id: "A1PA6795UKMFR9",
    name: "Germany",
    countryCode: "DE",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  FR: {
    id: "A13V1IB3VIYZZH",
    name: "France",
    countryCode: "FR",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  IT: {
    id: "APJ6JRA9NG5V4",
    name: "Italy",
    countryCode: "IT",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  ES: {
    id: "A1RKKUPIHCS9HS",
    name: "Spain",
    countryCode: "ES",
    endpoint: "https://sellingpartnerapi-eu.amazon.com",
  },
  JP: {
    id: "A1VC38T7YXB528",
    name: "Japan",
    countryCode: "JP",
    endpoint: "https://sellingpartnerapi-fe.amazon.com",
  },
};

/**
 * Amazon Listings API payload structure
 */
export interface AmazonListingPayload {
  sku: string;
  productType: string;
  requirements: "LISTING" | "LISTING_PRODUCT_ONLY" | "LISTING_OFFER_ONLY";
  attributes: {
    condition_type: Array<{ value: "new_new"; marketplace_id: string }>;
    item_name: Array<{ value: string; marketplace_id: string }>;
    description: Array<{ value: string; marketplace_id: string }>;
    list_price: Array<{
      value: number;
      currency: string;
      marketplace_id: string;
    }>;
    main_product_image_locator: Array<{
      value: string;
      marketplace_id: string;
    }>;
    other_product_image_locator?: Array<{
      value: string;
      marketplace_id: string;
    }>;
  };
}

/**
 * OAuth token data
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  sellerId: string;
  marketplaceId: string;
}

/**
 * Amazon connection status
 */
export interface ConnectionStatus {
  connected: boolean;
  sellerId?: string;
  marketplaceId?: string;
  connectedAt?: Date;
}

/**
 * Product upload result
 */
export interface UploadResult {
  productId: string;
  productName: string;
  status: "success" | "failed";
  amazonListingId?: string;
  error?: string;
}

/**
 * Upload history record
 */
export interface UploadHistory {
  id: string;
  productId: string;
  amazonListingId: string | null;
  sku: string;
  marketplaceId: string;
  status: string;
  errorMessage: string | null;
  uploadedAt: Date;
}

/**
 * Amazon API error codes
 */
export const AMAZON_ERROR_CODES = {
  QUOTA_EXCEEDED: "QuotaExceeded",
  INVALID_ACCESS_TOKEN: "InvalidAccessToken",
  ACCESS_DENIED: "AccessDenied",
  INVALID_INPUT: "InvalidInput",
  INTERNAL_FAILURE: "InternalFailure",
} as const;

/**
 * User-facing error messages
 */
export const ERROR_MESSAGES = {
  TOKEN_EXPIRED:
    "Amazon connection expired. Please reconnect your account in Settings.",
  RATE_LIMIT: "Amazon rate limit reached. Please try again in a few minutes.",
  INVALID_PRODUCT: "Product data is incomplete. Please check required fields.",
  NETWORK_ERROR:
    "Unable to reach Amazon. Please check your internet connection and try again.",
  SUBSCRIPTION_REQUIRED:
    "Upgrade to Pro to connect marketplaces and upload products.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  CONNECTION_NOT_FOUND:
    "Amazon connection not found. Please connect your account in Settings.",
  INVALID_MARKETPLACE: "Invalid marketplace selected.",
} as const;

/**
 * Amazon SP-API OAuth scopes
 */
export const AMAZON_OAUTH_SCOPES = [
  "sellingpartnerapi::migration",
  "sellingpartnerapi::notifications",
  "sellingpartnerapi::listings",
] as const;
