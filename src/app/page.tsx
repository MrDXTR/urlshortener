import Link from "next/link";
import { auth } from "~/server/auth";
import { ThemeToggle } from "./_components/theme-toggle";
import { HyperText } from "~/components/magicui/hyper-text";
import { BorderBeam } from "~/components/magicui/border-beam";
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
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">
            <HyperText>URL Shortener</HyperText>
          </h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <UrlListSheet />
                {session.user?.image && (
                  <Image
                    src={session.user?.image}
                    height={32}
                    width={32}
                    alt="Profile"
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <Link
                  href="/api/auth/signout"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Sign out
                </Link>
              </>
            ) : (
              <Link
                href="/api/auth/signin"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Sign in
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

        <div className="relative w-full max-w-md">
          <BorderBeam
            size={40}
            colorFrom="hsl(var(--primary))"
            colorTo="hsl(var(--secondary))"
          />
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Create Short URL</CardTitle>
              <CardDescription>
                Enter a long URL to create a shortened version
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
      <footer className="border-border bg-muted/20 border-t py-6">
        <div className="text-muted-foreground px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
