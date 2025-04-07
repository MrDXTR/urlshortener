"use client";

import { Button } from "~/components/ui/button";
import { ListIcon, ExternalLinkIcon } from "lucide-react";
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

export function UrlListSheet() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ListIcon className="h-4 w-4" />
          <span>My URLs</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto p-2 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Shortened URLs</SheetTitle>
          <SheetDescription>
            View and manage your shortened URLs
          </SheetDescription>
        </SheetHeader>

        <div className="my-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium">Recent URLs</h3>
            <span className="text-muted-foreground text-xs">
              {session.user.name}
            </span>
          </div>
          <Separator className="mb-4" />
          <UserUrlList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
