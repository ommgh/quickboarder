import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  weight: ["600"],
  subsets: ["latin"],
});

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center">
      <h1 className={cn("text-4xl font-semibold", font.className)}>Auth</h1>
      <p className=" text-muted-foreground text-sm">{label}</p>
    </div>
  );
};
