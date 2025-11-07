"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";

export function StoreSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href="/" prefetch>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar hover:text-foreground"
          >
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <Image
                src="/QL-LIGHT.svg"
                alt="Q"
                height={28}
                width={28}
                className="block dark:hidden"
              />

              <Image
                src="/QL-DARK.svg"
                alt="Q"
                height={28}
                width={28}
                className="hidden dark:block"
              />
            </div>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">QUICKBOARDER</span>
              <span className="truncate text-xs">FREE</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
