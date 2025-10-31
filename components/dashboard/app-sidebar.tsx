"use client";

import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import {
  IconBox,
  IconBrandGoogleAnalytics,
  IconBuildingStore,
  IconMan,
  IconMap,
  IconSettings,
} from "@tabler/icons-react";

import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Store",
      url: "/dashboard",
      icon: IconBuildingStore,
    },
    {
      title: "Product",
      url: "/dashboard/product",
      icon: IconBox,
    },

    {
      title: "Catalog",
      url: "/dashboard/catalog",
      icon: IconMap,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconBrandGoogleAnalytics,
    },
    {
      title: "Models",
      url: "/dashboard/models",
      icon: IconMan,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" prefetch>
                <div className="flex items-center justify-center">
                  <Image
                    src="/LOGO.svg"
                    alt="Q"
                    height={38}
                    width={38}
                    className="dark:invert"
                  />
                </div>
                <span className="font-bold text-xl group-[collapse]:hidden">
                  QUICKBOARDER
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
