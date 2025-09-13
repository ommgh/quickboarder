"use client";
import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

type Props = {
  onDetected: (barcode: string) => void;
};

export function CameraCapture({ onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        await codeReader.current.decodeFromVideoDevice(
          null, // default camera
          videoRef.current!,
          (result, err) => {
            if (!active) return;
            if (result) {
              onDetected(result.getText());
              codeReader.current.reset(); // stop scanning after detection
            }
          },
        );
      } catch (err) {
        console.error("Camera error", err);
      }
    };

    startCamera();
    return () => {
      active = false;
      codeReader.current.reset();
    };
  }, [onDetected]);

  return (
    <div className="flex flex-col items-center gap-2">
      <video ref={videoRef} className="w-full max-w-sm border rounded-md" />
      <p className="text-sm text-muted-foreground">
        Align barcode in frame to scan
      </p>
    </div>
  );
}
