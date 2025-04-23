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
import {
  UserIcon,
  LogOutIcon,
  Link2Icon,
  BarChart3Icon,
  ExternalLinkIcon,
  KeyIcon,
} from "lucide-react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { AnalyticsDialog } from "../analytics";
import { UrlManager } from "../url";
import { ApiKeyManager } from "../api-keys/api-key-manager";
import { FaGithub } from "react-icons/fa";
import { Skeleton } from "~/components/ui/skeleton";

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
  const { data: urlStats, isLoading } = api.url.getUserStats.useQuery();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showUrlManager, setShowUrlManager] = useState(false);
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:ring-primary/30 relative flex h-8 w-8 items-center justify-center rounded-full outline-none focus:ring-2">
          <Image
            src={imageUrl}
            height={32}
            width={32}
            alt="Profile"
            className="border-primary/20 hover:border-primary/40 min-h-8 min-w-8 rounded-full border transition-colors"
            priority
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mt-1 w-64">
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
                {isLoading ? (
                  <Skeleton className="mb-1 h-7 w-10" />
                ) : (
                  <span className="text-primary text-xl font-bold">
                    {urlStats?.totalUrls || 0}
                  </span>
                )}
                <span className="text-muted-foreground text-xs">
                  URLs Created
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                {isLoading ? (
                  <Skeleton className="mb-1 h-7 w-10" />
                ) : (
                  <span className="text-primary text-xl font-bold">
                    {urlStats?.totalClicks || 0}
                  </span>
                )}
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
          <DropdownMenuItem onClick={() => setShowApiKeyManager(true)}>
            <KeyIcon className="mr-2 h-4 w-4" />
            <span>API Keys</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowUrlManager(true)}
            className="flex sm:hidden"
          >
            <Link2Icon className="mr-2 h-4 w-4" />
            <span>My URLs</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="sm:hidden" />
          <Link
            href="https://github.com/MrDXTR/urlshortener"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DropdownMenuItem className="flex items-center justify-between sm:hidden">
              <div className="flex items-center gap-2">
                <FaGithub className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </div>
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
            </DropdownMenuItem>
          </Link>

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
      <UrlManager open={showUrlManager} onOpenChange={setShowUrlManager} />

      <AnalyticsDialog open={showAnalytics} onOpenChange={setShowAnalytics} />
      <ApiKeyManager
        open={showApiKeyManager}
        onOpenChange={setShowApiKeyManager}
      />
    </>
  );
}
