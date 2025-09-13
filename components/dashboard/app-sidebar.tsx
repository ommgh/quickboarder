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
import { GearIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import {
  IconBox,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconForklift,
  IconManFilled,
  IconSettings,
} from "@tabler/icons-react";
import { Maname } from "next/font/google";
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
          <SidebarMenuItem className="border-b-2 mt-0.5 p-1">
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" prefetch>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="https://res.cloudinary.com/dcwsgwsfw/image/upload/v1757573174/quickboarder/q-logo-dark_qwif13.png"
                    alt="Q"
                    height={"32"}
                    width={"32"}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Quickboarder</span>
                </div>
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
