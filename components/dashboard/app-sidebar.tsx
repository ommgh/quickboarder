"use client";

import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import {
  IconBox,
  IconBrandGoogleAnalytics,
  IconBuildingStore,
  IconMan,
  IconMap,
  IconSettings,
} from "@tabler/icons-react";

import { StoreSwitcher } from "./store-switcher";

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
        <StoreSwitcher />
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
