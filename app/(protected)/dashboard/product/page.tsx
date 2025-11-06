"use client";
import {
  BentoGrid,
  BentoGridItem,
  BentoGridSmall,
} from "@/components/ui/bento";
import { IconBarcode, IconSparkles, IconUser } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const enhanceItem = {
  title: "AI Enhance",
  description:
    "Drop raw images of your products and let our AI enhance them for you",
  header: (
    <Image
      src="/dashboard/enhance.svg"
      height={200}
      width={200}
      className="object-contain h-full w-full dark:invert"
      alt="Barcode"
    />
  ),
  icon: <IconSparkles className="h-4 w-4 text-neutral-500" />,
  link: "/dashboard/product/unique",
};

const ScanItem = {
  title: "Scan",
  description: "Scan your product barcodes to get e-commerce ready listings",
  header: (
    <Image
      src="/dashboard/barcode.svg"
      height={200}
      width={200}
      className="dark:invert"
      alt="Barcode"
    />
  ),
  icon: <IconBarcode className="h-4 w-4 text-neutral-500" />,
  link: "/dashboard/product/organised",
};
const Largeitems = [
  {
    title: "Apparel",
    description:
      "Drop your apparel images and get e-commerce ready photos with models",
    header: (
      <Image
        src="/dashboard/model.svg"
        height={520}
        width={520}
        className="dark:invert"
        alt="Barcode"
      />
    ),
    className: "md:row-span-2",
    icon: <IconUser className="h-4 w-4 text-neutral-500" />,
    link: "/dashboard/product/apparel",
  },
];
export default function Page() {
  const router = useRouter();
  return (
    <BentoGrid className="w-full m-auto md:grid-cols-2 md:auto-rows-[20rem] p-4">
      <BentoGridSmall
        title={ScanItem.title}
        description={ScanItem.description}
        header={ScanItem.header}
        icon={ScanItem.icon}
        onClick={() => router.push("/dashboard/product/organised")}
      />
      {Largeitems.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          className={item.className}
          icon={item.icon}
          onClick={() => router.push("/dashboard/product/apparel")}
        />
      ))}
      <BentoGridSmall
        title={enhanceItem.title}
        description={enhanceItem.description}
        header={enhanceItem.header}
        icon={enhanceItem.icon}
        onClick={() => router.push("/dashboard/product/unique")}
      />
    </BentoGrid>
  );
}
