"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogClose
} from "~/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { CalendarIcon, ArrowUpIcon } from "lucide-react";

interface AnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnalyticsDialog({ open, onOpenChange }: AnalyticsDialogProps) {
  const { data: userUrls, isLoading } = api.url.getUserUrls.useQuery();
  const { data: userStats } = api.url.getUserStats.useQuery();
  
  // Process chart data when URLs are loaded
  const chartData = userUrls
    ?.sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map(url => ({
      slug: url.slug.length > 12 ? url.slug.substring(0, 12) + "..." : url.slug,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-auto max-h-[90vh] md:max-h-[85vh] p-0">
        {/* Header Section with Stats */}
        <div className="bg-muted/40 p-6 border-b  overflow-auto">
          <DialogTitle className="text-xl mb-2">URL Analytics</DialogTitle>
          <DialogDescription>
            Track performance of your shortened URLs
          </DialogDescription>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-background rounded-lg p-3 shadow-sm">
              <div className="text-muted-foreground text-xs mb-1">Total URLs</div>
              <div className="text-2xl font-bold">{userStats?.totalUrls || 0}</div>
            </div>
            
            <div className="bg-background rounded-lg p-3 shadow-sm">
              <div className="text-muted-foreground text-xs mb-1">Total Clicks</div>
              <div className="text-2xl font-bold">{userStats?.totalClicks || 0}</div>
            </div>
            
            <div className="bg-background rounded-lg p-3 shadow-sm">
              <div className="text-muted-foreground text-xs mb-1">Avg. Per URL</div>
              <div className="text-2xl font-bold">
                {userStats?.totalUrls && userStats.totalUrls > 0 
                  ? (userStats.totalClicks / userStats.totalUrls).toFixed(1) 
                  : 0}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content - Scrollable */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 180px)" }}>
          <div className="space-y-6">
            {/* Chart Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <ArrowUpIcon className="mr-2 h-4 w-4 text-primary" />
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
                          color: "hsl(var(--chart-2))"
                        }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={chartData} 
                          layout="vertical" 
                          margin={{ top: 5, right: 25, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value: number) => value.toLocaleString()}
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
                                  `Clicks for ${entry?.payload.fullSlug || entry?.payload.slug}`
                                ]} 
                              />
                            )}
                          />
                          <Bar
                            dataKey="clicks"
                            name="clicks"
                            fill="hsl(var(--chart-1))"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {isLoading ? "Loading chart data..." : "No URL data available"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Table Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
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
                          <TableHead className="text-right w-[80px]">Clicks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userUrls.map(url => (
                          <TableRow key={url.id}>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {url.slug}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[260px] truncate">
                              <a 
                                href={url.longUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-primary truncate block"
                              >
                                {truncateUrl(url.longUrl)}
                              </a>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {new Date(url.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {url.clicks}
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
                      <p className="text-sm text-muted-foreground mt-2">
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