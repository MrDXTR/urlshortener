"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  CheckIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
  Trash2,
  ClockIcon,
  AlertCircle,
  LinkIcon,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Separator } from "~/components/ui/separator";
import { ShineBorder } from "~/components/magicui/shine-border";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Link from "next/link";

interface UrlManagerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this shortened URL? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UrlManager({ open, onOpenChange }: UrlManagerProps = {}) {
  const { data: session } = useSession();
  const utils = api.useUtils();
  const { data: urls, isLoading } = api.url.getUserUrls.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const { data: stats } = api.url.getUserStats.useQuery(undefined, {
    enabled: !!session?.user,
  });
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

  const deleteUrlMutation = api.url.deleteUrl.useMutation({
    onSuccess: () => {
      toast.success("URL deleted successfully");
      void utils.url.getUserUrls.invalidate();
      void utils.url.getUserStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const copyToClipboard = (e: React.MouseEvent, id: string, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shortUrl = `${window.location.origin}/${slug}`;
    void navigator.clipboard.writeText(shortUrl);
    setCopiedId(id);
    toast.success("Copied to clipboard!", {
      description: shortUrl,
    });

    // Reset copied state after 2 seconds
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteUrl = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setUrlToDelete(id);
  };

  const confirmDelete = () => {
    if (!urlToDelete) return;
    
    deleteUrlMutation.mutate({ id: urlToDelete });
    setUrlToDelete(null);
  };

  // If user is not logged in, just return a login link button
  if (!session?.user) {
    return (
      <Button asChild variant="outline" size="sm" className="relative gap-2">
        <Link href="/api/auth/signin">
          <LinkIcon className="h-4 w-4 text-primary" />
          <span>Sign in</span>
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative gap-2 border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10"
          >
            <LinkIcon className="h-4 w-4 text-primary" />
            <span>My URLs</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="overflow-y-auto border-primary/30 bg-background/95 p-4 backdrop-blur-lg sm:max-w-md"
        >
          <div className="absolute inset-0 pointer-events-none">
            <ShineBorder
              borderWidth={1}
              duration={10}
              shineColor={["hsl(var(--primary))", "hsl(var(--secondary))"]}
              className="opacity-30"
            />
          </div>

          <div className="flex items-center justify-between">
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl font-bold">Your URLs</SheetTitle>
              <SheetDescription>
                Access and manage all your shortened links
              </SheetDescription>
            </SheetHeader>
          </div>

          {stats && (
            <div className="my-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col justify-between rounded-lg border border-primary/20 bg-card/50 p-3">
                <span className="text-xs text-muted-foreground">Total URLs</span>
                <span className="text-2xl font-bold">{stats.totalUrls}</span>
              </div>
              <div className="flex flex-col justify-between rounded-lg border border-primary/20 bg-card/50 p-3">
                <span className="text-xs text-muted-foreground">Total Clicks</span>
                <span className="text-2xl font-bold">{stats.totalClicks}</span>
              </div>
            </div>
          )}

          <div className="relative my-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-primary/90">Recent URLs</h3>
              <div className="rounded-full bg-primary/10 px-2 py-1 text-xs text-muted-foreground">
                {session.user.name}
              </div>
            </div>
            <Separator className="mb-4 bg-primary/20" />
            <div className="relative z-20">
              {/* URL List Content */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/50 border-t-transparent" />
                </div>
              ) : !urls || urls.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed border-primary/30 p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <LinkIcon className="h-6 w-6 text-primary/70" />
                  </div>
                  <p className="text-muted-foreground">
                    You haven&apos;t created any shortened URLs yet.
                  </p>
                  <p className="text-primary/70 text-xs">
                    Create your first shortened URL to see it here!
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {urls.map((url) => {
                    const createdAt = new Date(url.createdAt);
                    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
                    
                    return (
                      <div
                        key={url.id}
                        className="relative overflow-hidden rounded-lg border border-primary/20 bg-card/70 p-4 transition-all hover:bg-card/90 hover:shadow-md"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <div className="flex flex-col space-y-3 relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-primary/10 transition-colors hover:bg-primary/20"
                              >
                                {url.slug}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-primary/60">
                                <TrendingUpIcon className="h-3 w-3" />
                                <span className="font-medium">{url.clicks}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ClockIcon className="h-3 w-3" />
                              <span>{timeAgo}</span>
                            </div>
                          </div>
                          
                          <div className="break-all text-sm text-muted-foreground">
                            {url.longUrl}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {`${window.location.origin}/${url.slug}`}
                            </div>
                            
                            <div className="flex gap-1 relative z-20">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => copyToClipboard(e, url.id, url.slug)}
                                className="h-8 w-8 transition-colors hover:bg-primary/10 relative z-20"
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
                                className="h-8 w-8 transition-colors hover:bg-primary/10 relative z-20"
                                asChild
                              >
                                <a
                                  href={`/${url.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="Open shortened URL"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => handleDeleteUrl(e, url.id)}
                                className="h-8 w-8 transition-colors hover:bg-destructive/20 relative z-20"
                              >
                                <Trash2 className="h-4 w-4 text-destructive/80" />
                                <span className="sr-only">Delete URL</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Using the custom deletion confirmation dialog */}
      <DeleteConfirmDialog 
        open={!!urlToDelete}
        onOpenChange={(open) => !open && setUrlToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
} 