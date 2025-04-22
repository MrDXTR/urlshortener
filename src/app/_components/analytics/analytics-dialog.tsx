"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
} from "recharts";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  CalendarIcon,
  ArrowUpIcon,
  TrendingUpIcon,
  LinkIcon,
} from "lucide-react";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
  const { data: userUrls, isLoading } = api.url.getUserUrls.useQuery();
  const { data: userStats } = api.url.getUserStats.useQuery();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      document.body.style.pointerEvents = "";
    }
    onOpenChange(newOpen);
  };

  // Process chart data when URLs are loaded
  const chartData =
    userUrls
      ?.sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
      .map((url) => ({
        slug:
          url.slug.length > 12 ? url.slug.substring(0, 12) + "..." : url.slug,
        fullSlug: url.slug,
        clicks: url.clicks,
      })) || [];

  // Helper function to truncate long URLs
  const truncateUrl = (url: string) => {
    if (url.length > 40) {
      return url.substring(0, 37) + "...";
    }
    return url;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] p-0 md:max-h-[90vh]">
        {/* Header Section with Stats */}
        <div className="bg-muted/40 border-b p-6">
          <DialogTitle className="mb-2 text-xl">URL Analytics</DialogTitle>
          <DialogDescription>
            Track performance of your shortened URLs
          </DialogDescription>

          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-3">
            <div className="bg-card border-border rounded-lg border p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-primary/10 mr-3 hidden rounded-full p-2 sm:block">
                  <LinkIcon className="text-primary h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Total URLs
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats?.totalUrls || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-primary/10 mr-3 hidden rounded-full p-2 sm:block">
                  <TrendingUpIcon className="text-primary h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Total Clicks
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats?.totalClicks || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-primary/10 mr-3 hidden rounded-full p-2 sm:block">
                  <ArrowUpIcon className="text-primary h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs">
                    Avg. Per URL
                  </div>
                  <div className="text-2xl font-bold">
                    {userStats?.totalUrls && userStats.totalUrls > 0
                      ? (userStats.totalClicks / userStats.totalUrls).toFixed(1)
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ maxHeight: "calc(85vh - 180px)" }}
        >
          <div className="space-y-6">
            {/* Chart Section */}
            <Card className="border-border border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <ArrowUpIcon className="text-primary mr-2 h-4 w-4" />
                  Top Performing URLs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  {chartData.length > 0 ? (
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
                          margin={{ top: 5, right: 25, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={true}
                            vertical={false}
                            stroke="var(--color-border)"
                          />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) =>
                              value.toLocaleString()
                            }
                          />
                          <YAxis
                            dataKey="slug"
                            type="category"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            width={100}
                          />
                          <ChartTooltip
                            content={({ active, payload }) => (
                              <ChartTooltipContent
                                active={active}
                                payload={payload}
                                formatter={(value, name, entry) => [
                                  value,
                                  `Clicks for ${entry?.payload.fullSlug || entry?.payload.slug}`,
                                ]}
                              />
                            )}
                          />
                          <Bar
                            dataKey="clicks"
                            name="clicks"
                            fill="var(--color-chart-1)"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {isLoading
                          ? "Loading chart data..."
                          : "No URL data available"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table Section */}
            <Card className="border-border mb-5 border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="text-primary mr-2 h-4 w-4" />
                  URL History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userUrls && userUrls.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[110px]">Short URL</TableHead>
                          <TableHead>Original URL</TableHead>
                          <TableHead className="w-[100px]">Created</TableHead>
                          <TableHead className="w-[80px] text-right">
                            Clicks
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userUrls.map((url) => (
                          <TableRow key={url.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="bg-secondary/30 font-mono"
                              >
                                {url.slug}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[260px] truncate">
                              <a
                                href={url.longUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary block truncate"
                              >
                                {truncateUrl(url.longUrl)}
                              </a>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <Badge variant="secondary">{url.clicks}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">
                      {isLoading ? "Loading URL data..." : "No URLs found"}
                    </p>
                    {!isLoading && userUrls?.length === 0 && (
                      <p className="text-muted-foreground mt-2 text-sm">
                        Create your first short URL to start tracking analytics
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
