import { z } from "zod";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { getValidApiKey } from "~/lib/api-key";
import { rateLimit } from "~/lib/rate-limit";
import { encryptUrl } from "~/lib/url-security";

// Validate URLs (reuse logic from existing tRPC routes)
// Use word boundaries to avoid false positives (e.g. "adults" in "group_adults=5")
const adultContentPatterns = [
  /\bporn\b/i,
  /\bxxx\b/i,
  /\badult\b/i,
  /\bsex\b/i,
  /\bescort\b/i,
  /\bnsfw\b/i,
];

const containsAdultContent = (url: string) => {
  return adultContentPatterns.some((pattern) => pattern.test(url));
};

const urlSchema = z
  .string()
  .url()
  .min(1)
  .refine((url) => !containsAdultContent(url), {
    message: "URLs containing adult content are not allowed",
  });

// Request schema
const requestSchema = z.object({
  url: urlSchema,
  customSlug: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get("Authorization");
    const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // Check rate limit (apply stricter limits for unauthenticated requests)
    const isAuthenticated = !!authHeader;
    const identifier = isAuthenticated ? authHeader : clientIp;
    const { success, limit, remaining, reset } = await rateLimit(identifier, {
      max: isAuthenticated ? 100 : 10, // Limit to 100 requests per 10 minutes for authenticated, 10 for anonymous
      windowMs: 10 * 60 * 1000, // 10 minutes window
    });

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit,
          remaining,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    // Parse the request body
    const body = await request.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: result.error.errors,
        },
        { status: 400 },
      );
    }

    const { url, customSlug } = result.data;
    let slug = customSlug;
    let userId = null;

    // Authenticate with API key if provided
    if (authHeader) {
      // Format should be "Bearer {api_key}"
      const apiKeyValue = authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

      const apiKeyResult = await getValidApiKey(apiKeyValue);

      if (apiKeyResult.status === "legacy") {
        return NextResponse.json(
          {
            error:
              "This API key was created before our security upgrade and must be rotated from the dashboard.",
          },
          { status: 401 },
        );
      }

      if (apiKeyResult.status !== "valid") {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
      }

      // Update last used timestamp
      await db.apiKey.update({
        where: { id: apiKeyResult.apiKey.id },
        data: { lastUsedAt: new Date() },
      });

      userId = apiKeyResult.apiKey.userId;
    }

    // Generate random slug if custom not provided
    if (!slug) {
      slug = nanoid(7);
    }

    // Check if slug exists
    const existing = await db.shortenedURL.findUnique({
      where: { slug },
    });

    if (existing) {
      if (customSlug) {
        return NextResponse.json(
          { error: "Custom slug already taken" },
          { status: 409 },
        );
      }

      // Try with a new slug
      slug = nanoid(7);
      const newSlugExists = await db.shortenedURL.findUnique({
        where: { slug },
      });

      if (newSlugExists) {
        return NextResponse.json(
          { error: "Failed to generate unique slug, please try again" },
          { status: 500 },
        );
      }
    }

    // Create the shortened URL
    const shortenedUrl = await db.shortenedURL.create({
      data: {
        slug,
        ...encryptUrl(url),
        userId,
      },
    });

    // Construct the full URL
    const host = request.headers.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const shortUrl = `${protocol}://${host}/${slug}`;

    return NextResponse.json(
      {
        id: shortenedUrl.id,
        shortUrl,
        slug: shortenedUrl.slug,
        longUrl: url,
        createdAt: shortenedUrl.createdAt,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
