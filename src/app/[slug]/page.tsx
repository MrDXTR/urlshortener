
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  if (typeof slug !== "string") {
    console.log(`Invalid slug parameter: ${slug}`);
    return notFound();
  }

  try {
    const headersList = headers();
    const headersObj = new Headers();

    for (const [key, value] of (await headersList).entries()) {
      headersObj.set(key, value);
    }

    const ctx = await createTRPCContext({ headers: headersObj });
    const caller = createCaller(ctx);
    const url = await caller.url.getBySlug({ slug });

    console.log(`Redirecting ${slug} to ${url.longUrl}`);
    redirect(url.longUrl);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error; // Let Next.js handle this
    }

    console.error(`Error processing slug ${slug}:`, error);
    return notFound();
  }
}