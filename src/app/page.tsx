import Link from "next/link";
import { auth } from "~/server/auth";
import { ThemeToggle } from "./_components/theme-toggle";
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
import { ProfileDropdown } from "./_components/profileinfo";
import { FaGithub } from "react-icons/fa";
import { Button } from "~/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background Effects */}
      <div className="from-background via-background/90 to-background/80 fixed inset-0 -z-10 bg-gradient-to-b"></div>

      {/* Header */}
      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">URL Shortener</h1>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/MrDXTR/urlshortener"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <FaGithub className="h-5 w-5" />
              </Button>
            </Link>

            {session ? (
              <>
                <UrlListSheet />
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
                className="text-primary hover:text-primary/90 bg-primary/10 hover:bg-primary/20 rounded-md px-3 py-1.5 text-sm transition-colors"
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

        <div className="relative mx-auto w-full max-w-md">
          <Card className="bg-card/80 border-primary/20 relative overflow-hidden shadow-md backdrop-blur">
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
                  <span className="text-primary/70 mt-1 block text-xs">
                    <Link
                      href="/api/auth/signin"
                      className="hover:text-primary underline"
                    >
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

      <footer className="border-border bg-muted/20 border-t py-6 backdrop-blur">
        <div className="text-muted-foreground px-4 text-center text-sm">
          <p>
            © {new Date().getFullYear()} URL Shortener. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
