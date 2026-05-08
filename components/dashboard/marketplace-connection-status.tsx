"use client";

import {
  IconLoader2,
  IconPlugConnected,
  IconPlugConnectedX,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getMarketplaceConnectionStatus,
  initiateConnection,
} from "@/actions/marketplace-connection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdapter } from "@/lib/marketplace/adapter-registry";
import type { MarketplaceProvider } from "@/types/marketplace";

/**
 * Marketplace Connection Status Component Props
 */
interface MarketplaceConnectionStatusProps {
  /** The marketplace provider (amazon, flipkart, etc.) */
  provider: MarketplaceProvider;
  /** Optional marketplace ID for providers that support multiple marketplaces */
  marketplaceId?: string;
  /** Whether to show the reconnect button when connection is expired */
  showReconnect?: boolean;
}

/**
 * Unified Marketplace Connection Status Component
 *
 * Displays the current connection status for a marketplace provider.
 * Shows connection details including seller ID and connection date.
 *
 * Features:
 * - Displays connection status badge (connected/disconnected)
 * - Shows seller ID when connected
 * - Shows connection date when connected
 * - Optional reconnect button for expired connections
 * - Uses Tabler Icons for visual indicators
 * - Styled with Tailwind CSS and shadcn/ui components
 *
 * @example
 * ```tsx
 * <MarketplaceConnectionStatus provider="amazon" showReconnect />
 * <MarketplaceConnectionStatus provider="flipkart" />
 * ```
 */
export function MarketplaceConnectionStatus({
  provider,
  marketplaceId,
  showReconnect = true,
}: MarketplaceConnectionStatusProps) {
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sellerId, setSellerId] = useState<string | undefined>();
  const [connectedAt, setConnectedAt] = useState<Date | undefined>();

  // Get marketplace metadata from adapter
  const adapter = getAdapter(provider);
  const metadata = adapter.getMarketplaceMetadata();

  // Fetch connection status on mount
  useEffect(() => {
    async function fetchConnectionStatus() {
      try {
        setLoading(true);
        const result = await getMarketplaceConnectionStatus({ provider });

        if (result?.serverError || result?.validationErrors) {
          console.error("Error fetching connection status:", result);
          return;
        }

        if (result?.data?.status) {
          setConnected(result.data.status.connected);
          setSellerId(result.data.status.sellerId);
          setConnectedAt(result.data.status.connectedAt);
        }
      } catch (error) {
        console.error("Error fetching connection status:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchConnectionStatus();
  }, [provider]);

  async function handleReconnect() {
    try {
      setReconnecting(true);

      const result = await initiateConnection({ provider, marketplaceId });

      if (result?.serverError || result?.validationErrors) {
        const errorMessage =
          result?.serverError ||
          "Failed to reconnect marketplace account. Please try again.";
        toast.error(errorMessage);
        return;
      }

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      if (result?.data?.authorizationUrl) {
        // Redirect to marketplace OAuth page
        window.location.href = result.data.authorizationUrl;
      }
    } catch (error) {
      console.error(`Error reconnecting ${metadata.displayName}:`, error);
      toast.error(`Failed to reconnect ${metadata.displayName} account`);
    } finally {
      setReconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <div className="flex-1">
          <p className="font-medium">{metadata.displayName}</p>
          <p className="text-sm text-muted-foreground">Loading status...</p>
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
        <IconPlugConnected className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{metadata.displayName}</p>
            <Badge variant="default" className="bg-green-600">
              Connected
            </Badge>
          </div>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {sellerId && (
              <p>
                Seller ID: <span className="font-medium">{sellerId}</span>
              </p>
            )}
            {connectedAt && (
              <p>
                Connected on{" "}
                <span className="font-medium">
                  {new Date(connectedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
      <IconPlugConnectedX className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <p className="font-medium">{metadata.displayName}</p>
        <p className="text-sm text-muted-foreground">Not connected</p>
      </div>
      {showReconnect && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          disabled={reconnecting}
        >
          {reconnecting ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Reconnecting...
            </>
          ) : (
            <>
              <IconRefresh className="mr-2 h-4 w-4" />
              Reconnect
            </>
          )}
        </Button>
      )}
    </div>
  );
}
