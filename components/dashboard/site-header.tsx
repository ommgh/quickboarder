"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  IconCreditCard,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
export function SiteHeader() {
  const session = useSession();
  const name = session.data?.user.name || "";
  const avatar = session.data?.user.image || "";
  const email = session.data?.user.email || "";
  return (
    <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center p-4 md:p-8">
      <SidebarTrigger className="md:hidden" />

      <div className="flex-1 flex items-center justify-end gap-2">
        <ThemeToggle />
        <Link href="/dashboard/settings">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={"bottom"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>
                      {name ? name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/dashboard/settings" prefetch>
                  <DropdownMenuItem>
                    <IconUserCircle />
                    Account
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Link>
      </div>
    </header>
  );
}
