"use client";
import { FileUpload } from "./FileUpload";
import type { UploadResult } from "@/types";
import { BentoGrid } from "../ui/bento";
import { MobileMockup } from "./MobileMockup";
import { IconCamera } from "@tabler/icons-react";

type Props = {
  onUpload: (result: UploadResult) => void;
};

export function UploadSection({ onUpload }: Props) {
  return (
    <BentoGrid className="w-full mx-auto md:grid-cols-2 md:auto-rows-[20rem]">
      <FileUpload onUpload={onUpload} className="border" />
      <div className="flex items-center relative justify-center border border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 md:row-span-2 overflow-hidden p-5">
        <MobileMockup className="size-full" />
      </div>
      <div className="flex items-center justify-center border border-muted-foreground/25 transition-colors hover:border-muted-foreground/50">
        <IconCamera className="h-8 w-8" />
      </div>
    </BentoGrid>
  );
}
