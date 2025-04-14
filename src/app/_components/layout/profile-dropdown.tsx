"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { UserIcon, LogOutIcon, Link2Icon, BarChart3Icon } from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { AnalyticsDialog } from "../analytics";

interface ProfileDropdownProps {
  imageUrl: string;
  name: string;
  email: string;
}

export function ProfileDropdown({
  imageUrl,
  name,
  email,
}: ProfileDropdownProps) {
  // Get user's URL stats
  const { data: urlStats } = api.url.getUserStats.useQuery();
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:ring-primary/30 rounded-full outline-none focus:ring-2">
          <Image
            src={imageUrl}
            height={32}
            width={32}
            alt="Profile"
            className="border-primary/20 hover:border-primary/40 h-8 w-8 rounded-full border transition-colors"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex flex-col gap-1">
            <span className="font-medium">{name}</span>
            <span className="text-muted-foreground text-xs font-normal">
              {email}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <div className="bg-muted/50 grid grid-cols-2 gap-2 rounded-md p-2">
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-primary text-xl font-bold">
                  {urlStats?.totalUrls || 0}
                </span>
                <span className="text-muted-foreground text-xs">
                  URLs Created
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <span className="text-primary text-xl font-bold">
                  {urlStats?.totalClicks || 0}
                </span>
                <span className="text-muted-foreground text-xs">
                  Total Clicks
                </span>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link2Icon className="mr-2 h-4 w-4" />
            <span>My URLs</span>
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => setShowAnalytics(true)}>
            <BarChart3Icon className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href="/api/auth/signout"
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOutIcon className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AnalyticsDialog open={showAnalytics} onOpenChange={setShowAnalytics} />
    </>
  );
}
