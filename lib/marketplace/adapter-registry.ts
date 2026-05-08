/**
 * Marketplace Adapter Registry
 *
 * Central registry that maps marketplace providers to their adapter implementations.
 * This module provides a single entry point for accessing platform-specific adapters.
 */

import type { MarketplaceProvider } from "@/types/marketplace";
import type { MarketplaceAdapter } from "./types";
import { AmazonAdapter } from "./adapters/amazon";
import { FlipkartAdapter } from "./adapters/flipkart";

/**
 * Error code for unsupported marketplace providers
 */
export const UNSUPPORTED_PROVIDER = "UNSUPPORTED_PROVIDER";

/**
 * Adapter registry
 * Maps marketplace providers to their adapter instances
 */
const adapters: Record<string, MarketplaceAdapter> = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  // Future adapters will be added here:
  // shopify: new ShopifyAdapter(),
  // ebay: new EbayAdapter(),
  // etsy: new EtsyAdapter(),
};

/**
 * Get adapter for a marketplace provider
 *
 * Returns the appropriate adapter instance for the given marketplace provider.
 * Throws an error if the provider is not supported.
 *
 * @param provider - The marketplace provider
 * @returns The marketplace adapter instance
 * @throws Error with code UNSUPPORTED_PROVIDER if provider is not supported
 *
 * @example
 * ```typescript
 * const adapter = getAdapter("amazon");
 * const endpoints = adapter.getOAuthEndpoints();
 * ```
 */
export function getAdapter(provider: MarketplaceProvider): MarketplaceAdapter {
  const adapter = adapters[provider];

  if (!adapter) {
    const error = new Error(
      `Marketplace provider "${provider}" is not supported. Supported providers: ${Object.keys(adapters).join(", ")}`,
    );
    (error as any).code = UNSUPPORTED_PROVIDER;
    throw error;
  }

  return adapter;
}

/**
 * Get list of supported marketplace providers
 *
 * @returns Array of supported provider names
 *
 * @example
 * ```typescript
 * const providers = getSupportedProviders();
 * // Returns: ["amazon", "flipkart"]
 * ```
 */
export function getSupportedProviders(): MarketplaceProvider[] {
  return Object.keys(adapters) as MarketplaceProvider[];
}

/**
 * Check if a provider is supported
 *
 * @param provider - The marketplace provider to check
 * @returns True if the provider is supported, false otherwise
 *
 * @example
 * ```typescript
 * if (isProviderSupported("amazon")) {
 *   // Provider is supported
 * }
 * ```
 */
export function isProviderSupported(
  provider: string,
): provider is MarketplaceProvider {
  return provider in adapters;
}
