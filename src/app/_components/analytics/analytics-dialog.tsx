"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  LinkIcon,
  TrendingUpIcon,
  MousePointerClickIcon,
  BarChart3Icon,
  ListIcon,
  ExternalLinkIcon,
  CopyIcon,
  HashIcon,
} from "lucide-react";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BAR_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
  const { data: userUrls, isLoading } = api.url.getUserUrls.useQuery();
  const { data: userStats } = api.url.getUserStats.useQuery();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      document.body.style.pointerEvents = "";
    }
    onOpenChange(newOpen);
  };

  const chartData = useMemo(
    () =>
      (userUrls ?? [])
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 6)
        .map((url) => ({
          slug:
            url.slug.length > 14
              ? url.slug.substring(0, 14) + "…"
              : url.slug,
          fullSlug: url.slug,
          clicks: url.clicks,
        })),
    [userUrls],
  );

  const totalUrls = userStats?.totalUrls ?? 0;
  const totalClicks = userStats?.totalClicks ?? 0;
  const avgClicks =
    totalUrls > 0 ? parseFloat((totalClicks / totalUrls).toFixed(1)) : 0;

  const copySlug = async (slug: string) => {
    const domain =
      typeof window !== "undefined" ? window.location.origin : "";
    await navigator.clipboard.writeText(`${domain}/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="border-b px-6 pt-6 pb-5">
          <DialogTitle className="text-lg font-semibold">
            Analytics
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-0.5 text-sm">
            Performance overview of your shortened URLs
          </DialogDescription>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard
              label="Total URLs"
              value={totalUrls}
              icon={<LinkIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Total Clicks"
              value={totalClicks}
              icon={<MousePointerClickIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />
            <StatCard
              label="Avg / URL"
              value={avgClicks}
              icon={<TrendingUpIcon className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b px-6 pt-2">
            <TabsList className="h-9">
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <BarChart3Icon className="h-3.5 w-3.5" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="urls" className="gap-1.5 text-xs">
                <ListIcon className="h-3.5 w-3.5" />
                All URLs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="overview"
            className="flex-1 overflow-y-auto px-6 pt-5 pb-6 max-h-[calc(100vh-290px)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium">Top Performing Links</h3>
              {chartData.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  Top {chartData.length}
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[280px]">
                <ChartContainer
                  config={{
                    clicks: {
                      label: "Clicks",
                      color: "var(--color-chart-1)",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 4, right: 30, left: 4, bottom: 4 }}
                      barCategoryGap="22%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal
                        vertical={false}
                        stroke="var(--color-border)"
                        opacity={0.5}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => v.toLocaleString()}
                      />
                      <YAxis
                        dataKey="slug"
                        type="category"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={110}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => (
                          <ChartTooltipContent
                            active={active}
                            payload={payload}
                            formatter={(value, _name, entry) => [
                              value,
                              `Clicks for /${entry?.payload?.fullSlug ?? entry?.payload?.slug}`,
                            ]}
                          />
                        )}
                      />
                      <Bar dataKey="clicks" name="clicks" radius={[0, 4, 4, 0]}>
                        {chartData.map((_entry, idx) => (
                          <Cell
                            key={idx}
                            fill={BAR_COLORS[idx % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent
            value="urls"
            className="flex-1 overflow-y-auto px-6 pt-4 pb-6"
            style={{ maxHeight: "calc(90vh - 290px)" }}
          >
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : userUrls && userUrls.length > 0 ? (
              <div className="space-y-2">
                {userUrls.map((url) => (
                  <div
                    key={url.id}
                    className="group border-border/60 hover:border-border hover:bg-muted/40 flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors"
                  >
                    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                      <span className="text-sm font-semibold tabular-nums">
                        {url.clicks}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="max-w-[200px] shrink-0 truncate font-mono text-[11px]"
                        >
                          <HashIcon className="mr-0.5 h-3 w-3 opacity-40" />
                          {url.slug}
                        </Badge>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => copySlug(url.slug)}
                              className="text-muted-foreground hover:text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <CopyIcon className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedSlug === url.slug
                              ? "Copied!"
                              : "Copy short URL"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <a
                        href={url.longUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 truncate text-xs transition-colors"
                      >
                        <span className="truncate">
                          {url.longUrl ?? "Unknown URL"}
                        </span>
                        <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                      </a>
                    </div>

                    <div className="text-muted-foreground hidden shrink-0 text-right text-[11px] sm:block">
                      {new Date(url.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year:
                          new Date(url.createdAt).getFullYear() !==
                            new Date().getFullYear()
                            ? "numeric"
                            : undefined,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}


function StatCard({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <div className="border-border bg-card rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-[11px] font-medium">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums tracking-tight">
            {isLoading ? (
              <Skeleton className="mt-0.5 h-6 w-12 rounded" />
            ) : (
              value.toLocaleString()
            )}
          </p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}

// Fallback UI 
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <BarChart3Icon className="text-muted-foreground/50 mb-3 h-8 w-8" />
      <p className="text-sm font-medium">No data yet</p>
      <p className="text-muted-foreground mt-1 max-w-[260px] text-xs">
        Create your first short URL to start tracking clicks and performance.
      </p>
    </div>
  );
}
