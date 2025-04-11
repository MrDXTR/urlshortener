"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

// List of adult content patterns to block
const adultContentPatterns = [
  /porn/i,
  /xxx/i,
  /adult/i,
  /sex/i,
  /escort/i,
  /nsfw/i,
];

// Function to check if URL contains adult content
const containsAdultContent = (url: string) => {
  return adultContentPatterns.some((pattern) => pattern.test(url));
};

// Form schema for authenticated users
const AuthFormSchema = z.object({
  longUrl: z
    .string()
    .min(1, { message: "URL is required" })
    .refine((url) => !containsAdultContent(url), {
      message: "URLs containing adult content are not allowed",
    }),
  customSlug: z.string().optional(),
});

// Form schema for anonymous users
const GuestFormSchema = z.object({
  longUrl: z
    .string()
    .min(1, { message: "URL is required" })
    .refine((url) => !containsAdultContent(url), {
      message: "URLs containing adult content are not allowed",
    }),
});

type AuthFormType = z.infer<typeof AuthFormSchema>;
type GuestFormType = z.infer<typeof GuestFormSchema>;

export function UrlShortenerForm() {
  const { data: session } = useSession();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Update origin on component mount
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Form for authenticated users (with custom slug)
  const authForm = useForm<z.infer<typeof AuthFormSchema>>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      longUrl: "",
      customSlug: "",
    },
    mode: "onSubmit", // Only validate on submit, not while typing
  });

  // Form for guest users (without custom slug)
  const guestForm = useForm<GuestFormType>({
    resolver: zodResolver(GuestFormSchema),
    defaultValues: {
      longUrl: "",
    },
    mode: "onSubmit", // Only validate on submit, not while typing
  });

  // Determine which form to use
  const form = session ? authForm : guestForm;

  // Mutation for authenticated users
  const createUrl = api.url.create.useMutation({
    onSuccess: (data) => {
      handleSuccess(data);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  // Mutation for anonymous users
  const createAnonUrl = api.url.createAnon.useMutation({
    onSuccess: (data) => {
      handleSuccess(data);
    },
    onError: (error) => {
      handleError(error);
    },
  });

  const handleSuccess = (data: { slug: string }) => {
    const shortUrl = `${origin}/${data.slug}`;
    setShortUrl(shortUrl);
    setError(null);

    // Automatically copy to clipboard
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        toast.success("URL shortened and copied to clipboard!", {
          description: shortUrl,
        });
      })
      .catch(() => {
        // Fall back to regular success message if clipboard access fails
        toast.success("URL shortened successfully!", {
          description: shortUrl,
        });
      });

    form.reset();
    setIsCreating(false);
  };

  const handleError = (error: { message: string }) => {
    setError(error.message);
    toast.error("Error shortening URL", {
      description: error.message,
    });
    setIsCreating(false);
  };

  // Handle form submission for authenticated users
  const onAuthSubmit = (values: z.infer<typeof AuthFormSchema>) => {
    setIsCreating(true);
    setShortUrl(null);
    setError(null);

    createUrl.mutate({
      url: values.longUrl,
      customSlug: values.customSlug,
    });
  };

  // Handle form submission for guest users
  const onGuestSubmit = (values: GuestFormType) => {
    setIsCreating(true);
    setShortUrl(null);
    setError(null);

    createAnonUrl.mutate({
      url: values.longUrl,
    });
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  // Try uncontrolled inputs as a backup solution
  const [longUrlInput, setLongUrlInput] = useState("");
  const [customSlugInput, setCustomSlugInput] = useState("");

  // Handle manual form submission without react-hook-form
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!longUrlInput) {
      setError("URL is required");
      return;
    }

    if (containsAdultContent(longUrlInput)) {
      setError("URLs containing adult content are not allowed");
      return;
    }

    setIsCreating(true);
    setShortUrl(null);
    setError(null);

    if (session) {
      createUrl.mutate({
        url: longUrlInput,
        customSlug: customSlugInput || undefined,
      });
    } else {
      createAnonUrl.mutate({
        url: longUrlInput,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Using simple form controls instead of react-hook-form to avoid validation issues */}
      <form onSubmit={handleManualSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">URL to shorten</label>
          <Input
            placeholder="https://example.com/very/long/url"
            autoComplete="off"
            className="border-primary/20 focus-visible:ring-primary/20 w-full"
            value={longUrlInput}
            onChange={(e) => setLongUrlInput(e.target.value)}
          />
        </div>

        {session && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Custom URL slug (optional)
            </label>
            <div className="flex items-center">
              <div className="bg-muted/50 text-muted-foreground border-primary/20 flex-shrink-0 rounded-l-md border border-r-0 px-3 py-2 text-sm">
                {origin}/
              </div>
              <Input
                placeholder="my-custom-url"
                autoComplete="off"
                className="border-primary/20 focus-visible:ring-primary/20 w-full rounded-l-none"
                value={customSlugInput}
                onChange={(e) => setCustomSlugInput(e.target.value)}
              />
            </div>
            {customSlugInput && (
              <p className="text-muted-foreground mt-1 text-xs">
                Preview: {origin}/{customSlugInput}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="bg-primary/90 hover:bg-primary w-full transition-colors"
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Shorten URL"}
        </Button>
      </form>

      {shortUrl && (
        <div className="bg-muted/40 border-primary/20 rounded-md border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="mr-3 flex-1">
              <p className="text-muted-foreground mb-1 text-xs">
                Your shortened URL:
              </p>
              <p className="text-sm font-medium break-all">{shortUrl}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 hover:bg-primary/10"
              onClick={copyToClipboard}
            >
              Copy
            </Button>
          </div>
          {!session && (
            <div className="border-primary/10 mt-3 border-t pt-3">
              <p className="text-muted-foreground text-xs">
                <Link
                  href="/api/auth/signin"
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>{" "}
                to create custom URLs and track analytics.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
