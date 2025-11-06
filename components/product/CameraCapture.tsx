// file: /CameraCapture.tsx
"use client";

import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadResult } from "@/types";
import { Camera } from "lucide-react";

type Props = {
  onUpload: (result: UploadResult) => void;
  className?: string;
};

export function CameraCapture({ onUpload, className }: Props) {
  const handleCapture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onUpload({ file, base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full p-4 border border-dashed border-muted-foreground/25 rounded-md hover:border-muted-foreground/50 transition-colors",
        className,
      )}
    >
      <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium mb-2">
        Capture a photo using your camera
      </p>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        id="camera-input"
        className="hidden"
        onChange={handleCapture}
      />
      <Button
        onClick={() => document.getElementById("camera-input")?.click()}
        variant="secondary"
        size="sm"
      >
        Open Camera
      </Button>
    </div>
  );
}
