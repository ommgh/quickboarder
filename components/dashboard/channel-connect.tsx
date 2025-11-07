"use client";

import Image from "next/image";
import { IconBuildingStore, IconLink, IconPlus } from "@tabler/icons-react";
import { Button } from "../ui/button";

type ChannelConnectProps = {
  connections: string[];
};

export function ChannelConnect({ connections }: ChannelConnectProps) {
  return (
    <div className="flex items-center justify-start border rounded-xl p-4 h-[200px] w-full gap-8 overflow-hidden mb-4">
      <div className="flex-shrink-0">
        <IconBuildingStore size={120} stroke={0.5} />
      </div>

      <IconLink size={36} stroke={1} />

      <div className="flex items-center gap-6 ml-0 md:ml-10 overflow-x-auto scrollbar-hide scroll-smooth w-full py-2">
        {connections.map((src, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-center justify-center border rounded-xl w-[120px] h-[120px] shadow-sm"
          >
            <Image
              src={src}
              alt={`Connection ${index + 1}`}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        ))}

        <Button
          className="flex-shrink-0 flex items-center justify-center border-2 border-dashed rounded-xl w-[120px] h-[120px]"
          variant="outline"
        >
          <IconPlus size={36} />
        </Button>
      </div>
    </div>
  );
}
