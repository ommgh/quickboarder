"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  initiateConnection,
  disconnectConnection,
  getMarketplaceConnectionStatus,
} from "@/actions/marketplace-connection";

/**
 * Flipkart Connection Status Component
 * Displays connection status and provides connect/disconnect functionality
 */

export function FlipkartConnectionStatus() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sellerId, setSellerId] = useState<string | undefined>();
  const [connectedAt, setConnectedAt] = useState<Date | undefined>();
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const fetchConnectionStatus = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getMarketplaceConnectionStatus({
        provider: "flipkart",
      });

      if (result?.data?.error) {
        console.error("Error fetching connection status:", result.data.error);
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
  }, []);

  // Fetch connection status on mount
  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  async function handleConnect() {
    try {
      setConnecting(true);

      const result = await initiateConnection({ provider: "flipkart" });

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      if (result?.data?.authorizationUrl) {
        // Redirect to Flipkart OAuth page
        window.location.href = result.data.authorizationUrl;
      }
    } catch (error) {
      console.error("Error connecting Flipkart:", error);
      toast.error("Failed to connect Flipkart account");
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnectClick() {
    setShowDisconnectDialog(true);
  }

  async function handleConfirmDisconnect() {
    try {
      setDisconnecting(true);
      setShowDisconnectDialog(false);

      const result = await disconnectConnection({ provider: "flipkart" });

      if (result?.data?.error) {
        toast.error(result.data.error);
        return;
      }

      toast.success("Flipkart account disconnected successfully");
      setConnected(false);
      setSellerId(undefined);
      setConnectedAt(undefined);
    } catch (error) {
      console.error("Error disconnecting Flipkart:", error);
      toast.error("Failed to disconnect Flipkart account");
    } finally {
      setDisconnecting(false);
    }
  }

  function handleCancelDisconnect() {
    setShowDisconnectDialog(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <span>Flipkart</span>
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (connected) {
    return (
      <>
        <div className="flex flex-col gap-2 rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Flipkart</span>
              <Badge variant="default" className="bg-green-600">
                Connected
              </Badge>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDisconnectClick}
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

        <Dialog
          open={showDisconnectDialog}
          onOpenChange={setShowDisconnectDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Flipkart Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect your Flipkart account?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelDisconnect}
                disabled={disconnecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDisconnect}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span>Flipkart</span>
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
