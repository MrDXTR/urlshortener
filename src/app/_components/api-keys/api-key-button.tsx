"use client";

import { useState } from "react";
import { ApiKeyManager } from "./api-key-manager";
import { Button } from "~/components/ui/button";
import { KeyIcon } from "lucide-react";

interface ApiKeyButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ApiKeyButton({
  variant = "outline",
  size = "default",
}: ApiKeyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        className="border-primary/30 bg-primary/5 hover:bg-primary/10 relative gap-2 text-xs transition-colors sm:text-sm"
        onClick={() => setIsOpen(true)}
      >
        <KeyIcon className="text-primary h-4 w-4" />
        <span className="sm:inline">API Keys</span>
      </Button>
      <ApiKeyManager open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}
