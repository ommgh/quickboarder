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
  IconBuildingStore,
  IconChartArrowsVertical,
  IconForklift,
  IconManFilled,
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
      icon: IconForklift,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartArrowsVertical,
    },
    {
      title: "Models",
      url: "/dashboard/models",
      icon: IconManFilled,
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
                <div className="flex size-8 items-center justify-center">
                  <Image
                    src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1760208544/quickboarder/Q-DARK_sio8kl.png"
                    alt="Q"
                    height={"32"}
                    width={"32"}
                    className="hidden dark:block"
                  />
                  <Image
                    src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1760208545/quickboarder/Q-LIGHT_tyy1gt.png"
                    alt="Q"
                    height={"32"}
                    width={"32"}
                    className="dark:hidden"
                  />
                </div>
                <span className="truncate font-bold text-xl">Quickboarder</span>
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
