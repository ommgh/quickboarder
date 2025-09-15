import { BentoGrid } from "@/components/ui/bento";
import { IconBarcode, IconSparkles, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export default function Page() {
  return (
    <BentoGrid className="w-full m-auto md:grid-cols-2 md:auto-rows-[20rem] p-4 md:p-8">
      <Link
        href="/dashboard/product/organised"
        prefetch
        className="flex items-center justify-center border border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
      >
        <IconBarcode />
      </Link>
      <Link
        href="/dashboard/product/apparel"
        prefetch
        className="flex items-center relative justify-center border border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 md:row-span-2 overflow-hidden p-5"
      >
        <IconUser />
      </Link>
      <Link
        href="/dashboard/product/unique"
        prefetch
        className="flex items-center justify-center border border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
      >
        <IconSparkles />
      </Link>
    </BentoGrid>
  );
}
