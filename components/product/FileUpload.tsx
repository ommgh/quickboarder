"use client";
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UploadResult } from "@/types";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onUpload: (result: UploadResult) => void;
};

export function FileUpload({
  onUpload,
  className,
}: Props & {
  className?: string;
}) {
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
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
    <div className={cn(className)}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-2 text-sm font-medium">
          Drag and drop your image here or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          Supports JPG, PNG, WEBP (Max 10MB)
        </p>
        <Input
          type="file"
          accept="image/*"
          id="upload-input"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          onClick={() => document.getElementById("upload-input")?.click()}
          variant={"secondary"}
          size="sm"
          className="mt-4"
        >
          Select Image
        </Button>
      </div>
    </div>
  );
}
