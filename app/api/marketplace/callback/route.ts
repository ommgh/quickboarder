/**
 * Unified Marketplace OAuth Callback Handler
 *
 * This API route handles OAuth callbacks from all marketplace platforms.
 * It validates the state parameter, exchanges the authorization code for tokens,
 * stores the tokens securely, and redirects the user back to the dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import type { MarketplaceProvider } from "@/types/marketplace";
import { handleCallback } from "@/lib/marketplace/oauth";
import { storeTokens } from "@/lib/marketplace/token-manager";
import {
  MarketplaceError,
  MarketplaceErrorCode,
  logMarketplaceError,
} from "@/lib/marketplace/errors";

/**
 * GET handler for OAuth callback
 *
 * Query parameters:
 * - code: Authorization code from OAuth provider
 * - state: CSRF protection state parameter
 * - provider: Marketplace provider (amazon, flipkart, etc.)
 * - error: Optional error from OAuth provider
 * - error_description: Optional error description
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Check for OAuth errors
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const errorDescription =
        searchParams.get("error_description") || oauthError;
      console.error("[OAuth Callback] OAuth provider error:", {
        error: oauthError,
        description: errorDescription,
      });

      return NextResponse.redirect(
        new URL(
          `/dashboard/settings?error=${encodeURIComponent(`Connection failed: ${errorDescription}`)}`,
          request.url,
        ),
      );
    }

    // Extract required parameters
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const provider = searchParams.get("provider") as MarketplaceProvider;

    // Validate required parameters
    if (!code) {
      throw new MarketplaceError(
        MarketplaceErrorCode.TOKEN_EXCHANGE_FAILED,
        "Authorization code missing from callback",
      );
    }

    if (!state) {
      throw new MarketplaceError(
        MarketplaceErrorCode.INVALID_STATE,
        "State parameter missing from callback",
      );
    }

    if (!provider) {
      throw new MarketplaceError(
        MarketplaceErrorCode.UNSUPPORTED_PROVIDER,
        "Provider parameter missing from callback",
      );
    }

    // Validate provider is supported
    const supportedProviders = [
      "amazon",
      "flipkart",
      "shopify",
      "ebay",
      "etsy",
    ];
    if (!supportedProviders.includes(provider)) {
      throw new MarketplaceError(
        MarketplaceErrorCode.UNSUPPORTED_PROVIDER,
        `Provider "${provider}" is not supported`,
        provider,
      );
    }

    // Handle OAuth callback
    const result = await handleCallback(code, state, provider);

    // Store tokens
    await storeTokens(
      result.userId,
      provider,
      result.tokens,
      result.sellerId,
      result.marketplaceId,
    );

    // Redirect to dashboard settings with success message
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?success=${encodeURIComponent(`${providerName} connected successfully!`)}`,
        request.url,
      ),
    );
  } catch (error) {
    // Log error with context
    logMarketplaceError(error as Error, {
      operation: "oauthCallback",
      url: request.url,
    });

    // Determine error message
    let errorMessage = "Failed to connect marketplace. Please try again.";
    if (error instanceof MarketplaceError) {
      errorMessage = error.getUserMessage();
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Redirect to dashboard settings with error message
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=${encodeURIComponent(errorMessage)}`,
        request.url,
      ),
    );
  }
}
