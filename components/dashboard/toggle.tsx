"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function DropdownThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <DropdownMenuItem
      onClick={handleToggleTheme}
      className="cursor-pointer focus:bg-muted hover:bg-muted flex items-center justify-between"
    >
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      {isDark ? (
        <SunIcon className="w-4 h-4" />
      ) : (
        <MoonIcon className="w-4 h-4" />
      )}
    </DropdownMenuItem>
  );
}
