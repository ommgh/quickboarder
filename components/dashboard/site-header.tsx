import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center justify-between border-b-2 gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Button>Upgrade</Button>
    </header>
  );
}
