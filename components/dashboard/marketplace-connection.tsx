"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  disconnectConnection,
  getMarketplaceConnectionStatus,
  initiateConnection,
} from "@/actions/marketplace-connection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdapter } from "@/lib/marketplace/adapter-registry";
import type { MarketplaceProvider } from "@/types/marketplace";

/**
 * Marketplace Connection Component Props
 */
interface MarketplaceConnectionProps {
  /** The marketplace provider (amazon, flipkart, etc.) */
  provider: MarketplaceProvider;
  /** Optional marketplace ID for providers that support multiple marketplaces */
  marketplaceId?: string;
}

/**
 * Unified Marketplace Connection Component
 *
 * Displays connection status and provides connect/disconnect functionality
 * for any supported marketplace provider.
 *
 * Features:
 * - Displays connection status (connected/disconnected)
 * - Shows seller ID and connection date when connected
 * - Handles OAuth flow initiation
 * - Handles connection disconnection
 * - Shows loading states during operations
 * - Displays toast notifications for success/error
 *
 * @example
 * ```tsx
 * <MarketplaceConnection provider="amazon" marketplaceId="ATVPDKIKX0DER" />
 * <MarketplaceConnection provider="flipkart" />
 * ```
 */
export function MarketplaceConnection({
  provider,
  marketplaceId,
}: MarketplaceConnectionProps) {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
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

  async function handleConnect() {
    try {
      setConnecting(true);

      const result = await initiateConnection({ provider, marketplaceId });

      if (result?.serverError || result?.validationErrors) {
        const errorMessage =
          result?.serverError ||
          "Failed to connect marketplace account. Please try again.";
        toast.error(errorMessage);
        return;
      }

      if (result?.data?.error) {
        // Check if it's a subscription error
        if (result.data.error.includes("Upgrade")) {
          toast.error(result.data.error, {
            action: {
              label: "Upgrade",
              onClick: () => {
                window.location.href = "/pricing";
              },
            },
          });
        } else {
          toast.error(result.data.error);
        }
        return;
      }

      if (result?.data?.authorizationUrl) {
        // Redirect to marketplace OAuth page
        window.location.href = result.data.authorizationUrl;
      }
    } catch (error) {
      console.error(`Error connecting ${metadata.displayName}:`, error);
      toast.error(`Failed to connect ${metadata.displayName} account`);
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true);

      const result = await disconnectConnection({ provider });

      if (result?.serverError || result?.validationErrors) {
        const errorMessage =
          result?.serverError ||
          "Failed to disconnect marketplace. Please try again.";
        toast.error(errorMessage);
        return;
      }

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      toast.success(
        result?.data?.message ||
          `${metadata.displayName} account disconnected successfully`,
      );
      setConnected(false);
      setSellerId(undefined);
      setConnectedAt(undefined);
    } catch (error) {
      console.error(`Error disconnecting ${metadata.displayName}:`, error);
      toast.error(`Failed to disconnect ${metadata.displayName} account`);
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <span>{metadata.displayName}</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex flex-col gap-2 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{metadata.displayName}</span>
            <Badge variant="default" className="bg-green-600">
              Connected
            </Badge>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              "Disconnect"
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          {sellerId && (
            <p>
              Seller ID: <span className="font-medium">{sellerId}</span>
            </p>
          )}
          {connectedAt && (
            <p>
              Connected:{" "}
              <span className="font-medium">
                {new Date(connectedAt).toLocaleDateString()}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span>{metadata.displayName}</span>
        <Button size="sm" onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect"
          )}
        </Button>
      </div>
    </div>
  );
}
