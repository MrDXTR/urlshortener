import Link from "next/link";
import { UrlShortener } from "~/app/_components/url-shortener";
import { auth } from "~/server/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          URL <span className="text-[hsl(280,100%,70%)]">Shortener</span>
        </h1>
        
        <UrlShortener />
        
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-lg text-white">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in to track your URLs"}
          </Link>
        </div>
      </div>
    </main>
  );
}
