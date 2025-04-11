"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  CheckIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function UserUrlList() {
  const { data: urls, isLoading } = api.url.getUserUrls.useQuery();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, slug: string) => {
    const shortUrl = `${window.location.origin}/${slug}`;
    void navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    toast.success("Copied to clipboard!", {
      description: shortUrl,
    });

    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="border-primary/50 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="border-primary/30 rounded-lg border border-dashed p-6 py-8 text-center">
        <p className="text-muted-foreground mb-2">
          You haven&apos;t created any shortened URLs yet.
        </p>
        <p className="text-primary/70 text-xs">
          Create your first shortened URL to see it here!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {urls.map((url) => (
        <div
          key={url.id}
          className="bg-card/70 hover:bg-card/90 border-primary/20 group relative flex items-center justify-between overflow-hidden rounded-md border p-4 transition-all hover:shadow-md"
        >
          <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative flex flex-col">
            <div className="mb-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                {url.slug}
              </Badge>
              <div className="text-primary/60 flex items-center gap-1 text-xs">
                <TrendingUpIcon className="h-3 w-3" />
                <span>{url.clicks}</span>
              </div>
            </div>
            <span className="text-muted-foreground max-w-[200px] truncate text-sm md:max-w-xs">
              {url.longUrl}
            </span>
          </div>

          <div className="relative flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(url.id, url.slug)}
              className="hover:bg-primary/10 h-8 w-8 transition-colors"
            >
              {copiedId === url.id ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy URL</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 h-8 w-8 transition-colors"
              asChild
            >
              <a
                href={`/${url.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open shortened URL"
              >
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
