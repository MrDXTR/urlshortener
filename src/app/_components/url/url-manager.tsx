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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

interface UrlManagerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      document.body.style.pointerEvents = "";
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const deleteUrlMutation = api.url.deleteUrl.useMutation({
    onSuccess: () => {
      toast.success("URL deleted successfully");
      void utils.url.getUserUrls.invalidate();
      void utils.url.getUserStats.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="border-primary/30 bg-background/95 overflow-y-auto p-4 backdrop-blur-lg sm:max-w-md"
        >
          <div className="pointer-events-none absolute inset-0">
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
              <div className="border-primary/20 bg-card/50 flex flex-col justify-between rounded-lg border p-3">
                <span className="text-muted-foreground text-xs">
                  Total URLs
                </span>
                <span className="text-2xl font-bold">{stats.totalUrls}</span>
              </div>
              <div className="border-primary/20 bg-card/50 flex flex-col justify-between rounded-lg border p-3">
                <span className="text-muted-foreground text-xs">
                  Total Clicks
                </span>
                <span className="text-2xl font-bold">{stats.totalClicks}</span>
              </div>
            </div>
          )}

          <div className="relative my-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-primary/90 text-sm font-medium">
                Recent URLs
              </h3>
              <div className="bg-primary/10 text-muted-foreground rounded-full px-2 py-1 text-xs">
                {session?.user?.name}
              </div>
            </div>
            <Separator className="bg-primary/20 mb-4" />
            <div className="relative z-20">
              {/* URL List Content */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="border-primary/50 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
              ) : !urls || urls.length === 0 ? (
                <div className="border-primary/30 flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <LinkIcon className="text-primary/70 h-6 w-6" />
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
                  {urls
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                    )
                    .map((url) => {
                      const createdAt = new Date(url.createdAt);
                      const timeAgo = formatDistanceToNow(createdAt, {
                        addSuffix: true,
                      });

                      return (
                        <div
                          key={url.id}
                          className="border-primary/20 bg-card/70 hover:bg-card/90 relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-md"
                        >
                          <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          <div className="relative z-10 flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10 hover:bg-primary/20 transition-colors"
                                >
                                  {url.slug}
                                </Badge>
                                <div className="text-primary/60 flex items-center gap-1 text-xs">
                                  <TrendingUpIcon className="h-3 w-3" />
                                  <span className="font-medium">
                                    {url.clicks}
                                  </span>
                                </div>
                              </div>

                              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                <ClockIcon className="h-3 w-3" />
                                <span>{timeAgo}</span>
                              </div>
                            </div>

                            <div className="text-muted-foreground text-sm break-all">
                              {url.longUrl}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-muted-foreground text-xs">
                                {`${window.location.origin}/${url.slug}`}
                              </div>

                              <div className="relative z-20 flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) =>
                                    copyToClipboard(e, url.id, url.slug)
                                  }
                                  className="hover:bg-primary/10 relative z-20 h-8 w-8 transition-colors"
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
                                  className="hover:bg-primary/10 relative z-20 h-8 w-8 transition-colors"
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
                                  className="hover:bg-destructive/20 relative z-20 h-8 w-8 transition-colors"
                                >
                                  <Trash2 className="text-destructive/80 h-4 w-4" />
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

      <AlertDialog
        open={!!urlToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setUrlToDelete(null);
            // Ensure pointer events are restored
            document.body.style.pointerEvents = "";
          }
        }}
      >
        <AlertDialogContent className="animate-in fade-in-50 zoom-in-95 duration-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5 animate-pulse" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shortened URL? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-colors duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-200 hover:scale-105"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
