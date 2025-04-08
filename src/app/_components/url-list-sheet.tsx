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
        <Button variant="ghost" size="sm" className="gap-2 bg-primary/10 hover:bg-primary/20 transition-colors relative">
          <LinkIcon className="h-4 w-4 text-primary" />
          <span>My URLs</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto p-4 sm:max-w-md bg-card/90 backdrop-blur-sm">
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

        <div className="my-6 relative">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary/90">Recent URLs</h3>
            <span className="text-muted-foreground text-xs px-2 py-1 bg-primary/10 rounded-full">
              {session.user.name}
            </span>
          </div>
          <Separator className="mb-4 bg-primary/20" />
          <UserUrlList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
