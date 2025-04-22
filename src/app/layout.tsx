import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/react";
import { Analytics } from "@vercel/analytics/react";
import { PointerEventsCleanup } from "./_components/pointer-events-cleanup";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Simple and fast URL shortener built with T3 Stack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </SessionProvider>
        </TRPCReactProvider>
        <PointerEventsCleanup />
        <Analytics />
      </body>
    </html>
  );
}
