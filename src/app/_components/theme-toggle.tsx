"use client";

import { Button } from "~/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "~/hooks/use-theme";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Toggle theme"
      >
        <SunIcon className="h-5 w-5 opacity-70" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full"
      aria-label="Toggle theme"
    >
      <SunIcon className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <MoonIcon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">
        {resolvedTheme === "dark"
          ? "Switch to light theme"
          : "Switch to dark theme"}
      </span>
    </Button>
  );
}
