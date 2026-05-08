"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  initiateConnection,
  disconnectConnection,
  getMarketplaceConnectionStatus,
} from "@/actions/marketplace-connection";
import { AMAZON_MARKETPLACES } from "@/types/amazon";

/**
 * Amazon Connection Status Component
 * Displays connection status and provides connect/disconnect functionality
 */

export function AmazonConnectionStatus() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sellerId, setSellerId] = useState<string | undefined>();
  const [marketplaceId, setMarketplaceId] = useState<string | undefined>();
  const [connectedAt, setConnectedAt] = useState<Date | undefined>();
  const selectedMarketplace = "IN";

  // Fetch connection status on mount
  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  async function fetchConnectionStatus() {
    try {
      setLoading(true);
      const result = await getMarketplaceConnectionStatus({
        provider: "amazon",
      });

      if (result?.data?.error) {
        console.error("Error fetching connection status:", result.data.error);
        return;
      }

      if (result?.data?.status) {
        setConnected(result.data.status.connected);
        setSellerId(result.data.status.sellerId);
        setMarketplaceId(result.data.status.marketplaceId);
        setConnectedAt(result.data.status.connectedAt);
      }
    } catch (error) {
      console.error("Error fetching connection status:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    try {
      setConnecting(true);

      const result = await initiateConnection({
        provider: "amazon",
        marketplaceId: AMAZON_MARKETPLACES[selectedMarketplace].id,
      });

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      if (result?.data?.authorizationUrl) {
        // Redirect to Amazon OAuth page
        window.location.href = result.data.authorizationUrl;
      }
    } catch (error) {
      console.error("Error connecting Amazon:", error);
      toast.error("Failed to connect Amazon account");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setDisconnecting(true);

      const result = await disconnectConnection({ provider: "amazon" });

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      toast.success("Amazon account disconnected successfully");
      setConnected(false);
      setSellerId(undefined);
      setMarketplaceId(undefined);
      setConnectedAt(undefined);
    } catch (error) {
      console.error("Error disconnecting Amazon:", error);
      toast.error("Failed to disconnect Amazon account");
    } finally {
      setDisconnecting(false);
    }
  }

  function getMarketplaceName(id: string | undefined): string {
    if (!id) return "Unknown";
    const marketplace = Object.values(AMAZON_MARKETPLACES).find(
      (m) => m.id === id,
    );
    return marketplace?.name || "Unknown";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <span>Amazon</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex flex-col gap-2 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Amazon</span>
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
          <p>
            Seller ID: <span className="font-medium">{sellerId}</span>
          </p>
          <p>
            Marketplace:{" "}
            <span className="font-medium">
              {getMarketplaceName(marketplaceId)}
            </span>
          </p>
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
        <span>Amazon</span>
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
      {/* <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Marketplace:</span>
        <Select
          value={selectedMarketplace}
          onValueChange={setSelectedMarketplace}
          disabled={connecting}
        >
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AMAZON_MARKETPLACES).map(([key, marketplace]) => (
              <SelectItem key={key} value={key}>
                {marketplace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div> */}
    </div>
  );
}
