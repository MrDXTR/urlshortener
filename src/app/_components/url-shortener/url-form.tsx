"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Shorten your URL</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              type="url"
              placeholder="Enter your long URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Custom slug (optional)"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Shortening..." : "Shorten URL"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 