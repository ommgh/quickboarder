"use client";
import { ModeToggle } from "../mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import UpgradeButton from "./Upgrade";
import { signOut, useSession } from "next-auth/react";
export function SiteHeader() {
  const session = useSession();
  const name = session.data?.user.name || "";
  const avatar = session.data?.user.image || "";
  const handleSignOut = () => {
    signOut();
  };
  return (
    <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center p-4 md:p-8">
      <SidebarTrigger className="md:hidden" />

      <div className="flex-1 flex items-center justify-end gap-2">
        <UpgradeButton productId="pdt_mfnm0X5FtPNHExUNipgzk" />
        <ModeToggle />
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>
            {name ? name.charAt(0).toUpperCase() : "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
