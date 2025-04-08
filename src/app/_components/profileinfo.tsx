"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "~/components/ui/dropdown-menu";
import { UserIcon, BarChart3Icon, LogOutIcon, Link2Icon } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Sample data for analytics
const monthlyData = [
  { name: "Jan", urls: 45, clicks: 180 },
  { name: "Feb", urls: 52, clicks: 220 },
  { name: "Mar", urls: 61, clicks: 340 },
  { name: "Apr", urls: 58, clicks: 280 },
  { name: "May", urls: 48, clicks: 260 },
  { name: "Jun", urls: 38, clicks: 190 },
  { name: "Jul", urls: 65, clicks: 390 },
];

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

interface ProfileDropdownProps {
  imageUrl: string;
  name: string;
  email: string;
}

export function ProfileDropdown({ imageUrl, name, email }: ProfileDropdownProps) {
  // Get user's URL stats
  const { data: urlStats } = api.url.getUserStats.useQuery();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:ring-2 focus:ring-primary/30 rounded-full">
        <Image
          src={imageUrl}
          height={32}
          width={32}
          alt="Profile"
          className="h-8 w-8 rounded-full border border-primary/20 hover:border-primary/40 transition-colors"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground text-xs font-normal">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="grid grid-cols-2 gap-2 rounded-md bg-muted/50 p-2">
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-primary text-xl font-bold">{urlStats?.totalUrls || 0}</span>
              <span className="text-muted-foreground text-xs">URLs Created</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <span className="text-primary text-xl font-bold">{urlStats?.totalClicks || 0}</span>
              <span className="text-muted-foreground text-xs">Total Clicks</span>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link2Icon className="mr-2 h-4 w-4" />
          <span>My URLs</span>
        </DropdownMenuItem>
        
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <BarChart3Icon className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="text-xl">URL Analytics Dashboard</DialogTitle>
              <DialogDescription>
                Overview of your URL performance
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4 h-[350px]">
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
              
              <TabsContent value="monthly" className="mt-4 h-[350px]">
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
            </Tabs>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/api/auth/signout" className="text-destructive focus:text-destructive cursor-pointer">
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}