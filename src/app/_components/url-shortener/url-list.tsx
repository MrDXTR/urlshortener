"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

export function UserUrlList() {
  const { data: urls, isLoading } = api.url.getUserUrls.useQuery();

  const copyToClipboard = (slug: string) => {
    const shortUrl = `${window.location.origin}/${slug}`;
    void navigator.clipboard.writeText(shortUrl);
    toast.success("Copied to clipboard!", {
      description: shortUrl,
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mt-8">
        <CardHeader>
          <CardTitle>Your shortened URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading your URLs...</p>
        </CardContent>
      </Card>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <Card className="w-full max-w-4xl mt-8">
        <CardHeader>
          <CardTitle>Your shortened URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You haven't created any shortened URLs yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mt-8">
      <CardHeader>
        <CardTitle>Your shortened URLs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {urls.map((url) => (
            <div key={url.id} className="flex items-center justify-between border p-4 rounded-md">
              <div className="flex flex-col">
                <Badge className="w-fit mb-2">{url.slug}</Badge>
                <span className="text-sm text-muted-foreground truncate max-w-md">{url.longUrl}</span>
                <span className="text-xs text-muted-foreground mt-1">Clicks: {url.clicks}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(url.slug)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 