"use client";

import { BarChartIcon } from "lucide-react";
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
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useSession } from "next-auth/react";

// Sample data for global analytics
const monthlyData = [
  { name: "Jan", urls: 45, clicks: 180 },
  { name: "Feb", urls: 52, clicks: 220 },
  { name: "Mar", urls: 61, clicks: 340 },
  { name: "Apr", urls: 58, clicks: 280 },
  { name: "May", urls: 48, clicks: 260 },
  { name: "Jun", urls: 38, clicks: 190 },
  { name: "Jul", urls: 65, clicks: 390 },
];

const deviceData = [
  { name: "Desktop", value: 55 },
  { name: "Mobile", value: 35 },
  { name: "Tablet", value: 10 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

const chartConfig = {
  urls: {
    label: "URLs Created",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
  clicks: {
    label: "Total Clicks",
    theme: {
      light: "hsl(var(--secondary))",
      dark: "hsl(var(--secondary))",
    },
  },
};

export function AnalyticsButton() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 bg-secondary/10 hover:bg-secondary/20 transition-colors">
          <BarChartIcon className="h-4 w-4 text-secondary" />
          <span>Analytics</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-xl">URL Analytics Dashboard</DialogTitle>
          <DialogDescription>
            Comprehensive analytics for all your shortened URLs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Click Trends</TabsTrigger>
            <TabsTrigger value="devices">Device Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 h-[350px]">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-sm font-medium">Monthly Summary</h3>
              <p className="text-xs text-muted-foreground">URLs created and total clicks per month</p>
            </div>
            <ChartContainer config={chartConfig}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--secondary))" />
                <Bar 
                  yAxisId="left" 
                  dataKey="urls" 
                  radius={[4, 4, 0, 0]} 
                  className="fill-primary"
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="clicks" 
                  radius={[4, 4, 0, 0]} 
                  className="fill-secondary" 
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4 h-[350px]">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-sm font-medium">Click Trends</h3>
              <p className="text-xs text-muted-foreground">Monthly click performance</p>
            </div>
            <ChartContainer config={chartConfig}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  strokeWidth={2}
                  className="stroke-secondary"
                  dot={{ fill: "hsl(var(--secondary))" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="devices" className="mt-4 h-[350px]">
            <div className="flex flex-col gap-2 mb-4">
              <h3 className="text-sm font-medium">Device Distribution</h3>
              <p className="text-xs text-muted-foreground">Breakdown of devices used to access your shortened URLs</p>
            </div>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
              </PieChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 