"use client";

import { Button } from "~/components/ui/button";
import { ListIcon, LinkIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "~/components/ui/sheet";
import { UserUrlList } from "./url-shortener/url-list";
import { Separator } from "~/components/ui/separator";
import { ShineBorder } from "~/components/magicui/shine-border";

interface UrlListSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UrlListSheet({ open, onOpenChange }: UrlListSheetProps = {}) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="bg-primary/10 hover:bg-primary/20 relative gap-2 transition-colors"
        >
          <LinkIcon className="text-primary h-4 w-4" />
          <span>My URLs</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="bg-card/90 overflow-y-auto p-4 backdrop-blur-sm sm:max-w-md"
      >
        <div className="absolute inset-0">
          <ShineBorder
            borderWidth={1}
            duration={10}
            shineColor={["hsl(var(--primary))", "hsl(var(--secondary))"]}
            className="opacity-30"
          />
        </div>

        <SheetHeader className="relative pb-2">
          <SheetTitle className="text-xl">Your Collection</SheetTitle>
          <SheetDescription>
            Access and manage all your shortened URLs
          </SheetDescription>
        </SheetHeader>

        <div className="relative my-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-primary/90 text-sm font-medium">Recent URLs</h3>
            <span className="text-muted-foreground bg-primary/10 rounded-full px-2 py-1 text-xs">
              {session.user.name}
            </span>
          </div>
          <Separator className="bg-primary/20 mb-4" />
          <UserUrlList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
