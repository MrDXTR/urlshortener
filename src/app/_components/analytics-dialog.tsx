"use client";

import { useState } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { InfoIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Sample data - in a real app this would come from your API
const dailyData = [
  { name: "Mon", clicks: 12 },
  { name: "Tue", clicks: 18 },
  { name: "Wed", clicks: 29 },
  { name: "Thu", clicks: 22 },
  { name: "Fri", clicks: 16 },
  { name: "Sat", clicks: 8 },
  { name: "Sun", clicks: 14 },
];

const referrerData = [
  { name: "Direct", clicks: 45 },
  { name: "Google", clicks: 30 },
  { name: "Twitter", clicks: 22 },
  { name: "Facebook", clicks: 15 },
  { name: "Other", clicks: 10 },
];

const locationData = [
  { name: "US", clicks: 38 },
  { name: "UK", clicks: 22 },
  { name: "India", clicks: 18 },
  { name: "Germany", clicks: 12 },
  { name: "Others", clicks: 32 },
];

const chartConfig = {
  clicks: {
    label: "Clicks",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
};

export function AnalyticsDialog({ slug, totalClicks }: { slug: string; totalClicks: number }) {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 transition-colors">
          <InfoIcon className="h-4 w-4 text-primary" />
          <span className="sr-only">View Analytics</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Analytics for /{slug}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">{totalClicks} total clicks</span>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily Traffic</TabsTrigger>
            <TabsTrigger value="referrers">Top Referrers</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4 h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={dailyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="clicks"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="referrers" className="mt-4 h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={referrerData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="clicks"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="locations" className="mt-4 h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={locationData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="clicks"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 