import Link from "next/link";
import { auth } from "~/server/auth";
import { ThemeToggle } from "./_components/theme-toggle";
import { BorderBeam } from "~/components/magicui/border-beam";
import { InteractiveGridPattern } from "~/components/magicui/interactive-grid-pattern";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { UrlShortener } from "./_components/url-shortener";
import { FeaturesSection } from "./_components/features-section";
import { UrlListSheet } from "./_components/url-list-sheet";
import { AuroraText } from "~/components/magicui/aurora-text";
import { ProfileDropdown } from "./_components/profileinfo";
import { AnalyticsButton } from "./_components/analytics-button";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background/90 to-background/80"></div>
      
      {/* Header */}
      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">
            <AuroraText colors={["hsl(var(--primary))", "hsl(var(--secondary))"]} speed={0.7}>
              URL Shortener
            </AuroraText>
          </h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <UrlListSheet />
                <AnalyticsButton />
                {session.user?.image && (
                  <ProfileDropdown 
                    imageUrl={session.user.image} 
                    name={session.user.name || "User"} 
                    email={session.user.email || ""}
                  />
                )}
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/20 text-sm transition-colors px-3 py-1.5 rounded-md"
              >
                Sign in to save URLs
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex flex-1 flex-col items-center justify-center gap-8 px-4 pt-24 pb-16">
        <div className="w-full max-w-md space-y-2 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Shorten your{" "}
            <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
              links
            </span>
          </h2>
          <p className="text-muted-foreground">
            Simple, fast, and reliable URL shortening service
          </p>
        </div>

        <div className="w-full max-w-md relative mx-auto">
          <Card className="bg-card/80 backdrop-blur relative overflow-hidden border-primary/20 shadow-md">
            <BorderBeam
              size={40}
              colorFrom="hsl(var(--primary))"
              colorTo="hsl(var(--secondary))"
              duration={8}
            />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Create Short URL</CardTitle>
              <CardDescription>
                Enter a long URL to create a shortened version
                {!session && (
                  <span className="block mt-1 text-xs text-primary/70">
                    <Link href="/api/auth/signin" className="underline hover:text-primary">
                      Sign in
                    </Link>{" "}
                    to keep track of your shortened URLs
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UrlShortener />
            </CardContent>
          </Card>
        </div>

        <FeaturesSection />
      </main>

      {/* Footer */}
      <footer className="border-border bg-muted/20 backdrop-blur border-t py-6">
        <div className="text-muted-foreground px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
