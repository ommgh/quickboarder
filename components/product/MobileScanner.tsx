"use client";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

type Props = {
  onDetected: (barcode: string) => void;
};

export function MobileScanner({ onDetected }: Props) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const mobileUrl = `${window.location.origin}/mobile-scanner?id=${sessionId}`;

  // TODO: poll /api/session/${sessionId} until barcode is set

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm">
        Scan this QR with your phone to open the scanner:
      </p>
      <QRCodeSVG value={mobileUrl} size={180} />
      <Button
        variant="outline"
        onClick={() => window.open(mobileUrl, "_blank")}
      >
        Open Scanner in New Tab
      </Button>
      <p className="text-xs text-muted-foreground">
        After scanning on mobile, product will appear here automatically.
      </p>
    </div>
  );
}
