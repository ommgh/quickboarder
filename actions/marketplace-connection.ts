"use server";

/**
 * Unified Marketplace Connection Server Actions
 *
 * Type-safe server actions for marketplace connection operations.
 * These actions handle authentication, subscription validation, and marketplace operations.
 */

import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { actionClient } from "./safe-action";
import type { MarketplaceProvider } from "@/types/marketplace";
import { generateAuthorizationUrl } from "@/lib/marketplace/oauth";
import {
  revokeConnection,
  getConnectionStatus,
} from "@/lib/marketplace/token-manager";
import {
  MarketplaceError,
  MarketplaceErrorCode,
  logMarketplaceError,
} from "@/lib/marketplace/errors";

/**
 * Schema for initiating marketplace connection
 */
const InitiateConnectionSchema = z.object({
  provider: z.enum(["amazon", "flipkart", "shopify", "ebay", "etsy"]),
  marketplaceId: z.string().optional(),
});

/**
 * Schema for disconnecting marketplace
 */
const DisconnectConnectionSchema = z.object({
  provider: z.enum(["amazon", "flipkart", "shopify", "ebay", "etsy"]),
});

/**
 * Schema for getting connection status
 */
const GetConnectionStatusSchema = z.object({
  provider: z.enum(["amazon", "flipkart", "shopify", "ebay", "etsy"]),
});

/**
 * Initiate marketplace connection
 *
 * Generates an OAuth authorization URL for the specified marketplace provider.
 * Validates user authentication and subscription plan before proceeding.
 *
 * @param values - Provider and optional marketplace ID
 * @returns Authorization URL for redirect or error message
 *
 * @example
 * ```typescript
 * const result = await initiateConnection({ provider: "amazon", marketplaceId: "ATVPDKIKX0DER" });
 * if (result.data?.success) {
 *   window.location.href = result.data.authorizationUrl;
 * }
 * ```
 */
export const initiateConnection = actionClient
  .schema(InitiateConnectionSchema)
  .action(async ({ parsedInput: { provider, marketplaceId } }) => {
    try {
      // Check authentication
      const session = await auth();
      if (!session?.user?.id) {
        return {
          success: false,
          error: "You must be logged in to connect marketplaces.",
        };
      }

      const userId = session.user.id;

      // Check subscription plan
      const subscription = await db.subscription.findUnique({
        where: { userId },
      });

      if (!subscription || subscription.name === "FREE") {
        throw new MarketplaceError(
          MarketplaceErrorCode.SUBSCRIPTION_REQUIRED,
          undefined,
          provider,
        );
      }

      // Generate authorization URL
      const { url } = await generateAuthorizationUrl(
        userId,
        provider,
        marketplaceId,
      );

      return {
        success: true,
        authorizationUrl: url,
      };
    } catch (error) {
      logMarketplaceError(error as Error, {
        operation: "initiateConnection",
        userId: (await auth())?.user?.id,
        provider,
        marketplaceId,
      });

      if (error instanceof MarketplaceError) {
        return {
          success: false,
          error: error.getUserMessage(),
        };
      }

      return {
        success: false,
        error: "Failed to initiate marketplace connection. Please try again.",
      };
    }
  });

/**
 * Disconnect marketplace connection
 *
 * Revokes the marketplace connection and removes all stored tokens.
 *
 * @param values - Provider to disconnect
 * @returns Success message or error
 *
 * @example
 * ```typescript
 * const result = await disconnectConnection({ provider: "amazon" });
 * if (result.data?.success) {
 *   console.log("Disconnected successfully");
 * }
 * ```
 */
export const disconnectConnection = actionClient
  .schema(DisconnectConnectionSchema)
  .action(async ({ parsedInput: { provider } }) => {
    try {
      // Check authentication
      const session = await auth();
      if (!session?.user?.id) {
        return {
          success: false,
          error: "You must be logged in to disconnect marketplaces.",
        };
      }

      const userId = session.user.id;

      // Revoke connection
      await revokeConnection(userId, provider);

      return {
        success: true,
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connection removed successfully.`,
      };
    } catch (error) {
      logMarketplaceError(error as Error, {
        operation: "disconnectConnection",
        userId: (await auth())?.user?.id,
        provider,
      });

      if (error instanceof MarketplaceError) {
        return {
          success: false,
          error: error.getUserMessage(),
        };
      }

      return {
        success: false,
        error: "Failed to disconnect marketplace. Please try again.",
      };
    }
  });

/**
 * Get marketplace connection status
 *
 * Returns the current status of a marketplace connection.
 *
 * @param values - Provider to check
 * @returns Connection status or error
 *
 * @example
 * ```typescript
 * const result = await getMarketplaceConnectionStatus({ provider: "amazon" });
 * if (result.data?.success && result.data.status.connected) {
 *   console.log(`Connected as seller ${result.data.status.sellerId}`);
 * }
 * ```
 */
export const getMarketplaceConnectionStatus = actionClient
  .schema(GetConnectionStatusSchema)
  .action(async ({ parsedInput: { provider } }) => {
    try {
      // Check authentication
      const session = await auth();
      if (!session?.user?.id) {
        return {
          success: false,
          error: "You must be logged in to check connection status.",
        };
      }

      const userId = session.user.id;

      // Get connection status
      const status = await getConnectionStatus(userId, provider);

      return {
        success: true,
        status,
      };
    } catch (error) {
      logMarketplaceError(error as Error, {
        operation: "getConnectionStatus",
        userId: (await auth())?.user?.id,
        provider,
      });

      if (error instanceof MarketplaceError) {
        return {
          success: false,
          error: error.getUserMessage(),
        };
      }

      return {
        success: false,
        error: "Failed to get connection status. Please try again.",
      };
    }
  });
