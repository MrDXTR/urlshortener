"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { UrlManager } from "./url-manager";
import { LinkIcon } from "lucide-react";

export function UrlButton() {
  const [showUrlManager, setShowUrlManager] = useState(false);

  return (
    <div className="relative hidden sm:block">
      {" "}
      <Button
        variant="outline"
        size="sm"
        className="border-primary/30 bg-primary/5 hover:bg-primary/10 relative gap-2 transition-colors"
        onClick={() => setShowUrlManager(true)}
      >
        <LinkIcon className="text-primary h-4 w-4" />
        <span>My URLs</span>
      </Button>
      <UrlManager open={showUrlManager} onOpenChange={setShowUrlManager} />
    </div>
  );
}
