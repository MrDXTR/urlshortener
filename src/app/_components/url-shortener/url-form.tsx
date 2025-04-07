"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { api } from "~/trpc/react";

export function UrlShortenerForm() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createUrl = api.url.create.useMutation({
    onSuccess: (data) => {
      const shortUrl = `${window.location.origin}/${data.slug}`;
      void navigator.clipboard.writeText(shortUrl);
      toast.success("URL shortened! Copied to clipboard", {
        description: shortUrl,
      });
      setUrl("");
      setCustomSlug("");
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error("Error shortening URL", {
        description: error.message,
      });
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    createUrl.mutate({
      url,
      customSlug: customSlug || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="long-url">URL to shorten</Label>
        <Input
          id="long-url"
          type="url"
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="custom-slug">Custom slug</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="text-muted-foreground h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Create a custom short URL. If left empty, a random slug will
                  be generated.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="custom-slug"
          type="text"
          placeholder="my-custom-link"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="mt-2 w-full">
        {isLoading ? "Shortening..." : "Shorten URL"}
      </Button>
    </form>
  );
}
