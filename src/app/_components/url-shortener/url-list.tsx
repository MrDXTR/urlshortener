"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, CheckIcon, ExternalLinkIcon, TrendingUpIcon } from "lucide-react";
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
      <div className="py-8 flex justify-center items-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="py-8 text-center rounded-lg border border-dashed border-primary/30 p-6">
        <p className="text-muted-foreground mb-2">
          You haven&apos;t created any shortened URLs yet.
        </p>
        <p className="text-xs text-primary/70">Create your first shortened URL to see it here!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {urls.map((url) => (
        <div
          key={url.id}
          className="bg-card/70 hover:bg-card/90 flex items-center justify-between rounded-md border border-primary/20 p-4 transition-all hover:shadow-md relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="flex flex-col relative">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors">
                {url.slug}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-primary/60">
                <TrendingUpIcon className="h-3 w-3" />
                <span>{url.clicks}</span>
              </div>
            </div>
            <span className="text-muted-foreground max-w-[200px] truncate text-sm md:max-w-xs">
              {url.longUrl}
            </span>
          </div>
          
          <div className="flex gap-1 relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyToClipboard(url.id, url.slug)}
              className="h-8 w-8 hover:bg-primary/10 transition-colors"
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
              className="h-8 w-8 hover:bg-primary/10 transition-colors" 
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
