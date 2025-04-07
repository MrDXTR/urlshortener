"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, CheckIcon, ExternalLinkIcon } from "lucide-react";
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
      <p className="text-muted-foreground py-4 text-center">
        Loading your URLs...
      </p>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center">
        You haven't created any shortened URLs yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {urls.map((url) => (
        <div
          key={url.id}
          className="bg-card/50 hover:bg-card/80 flex items-center justify-between rounded-md border p-4 transition-colors"
        >
          <div className="flex flex-col">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="w-fit">{url.slug}</Badge>
              <span className="text-muted-foreground text-xs">
                {url.clicks} {url.clicks === 1 ? "click" : "clicks"}
              </span>
            </div>
            <span className="text-muted-foreground max-w-[200px] truncate text-sm md:max-w-xs">
              {url.longUrl}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(url.id, url.slug)}
              className="h-8 w-8"
            >
              {copiedId === url.id ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy URL</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
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
