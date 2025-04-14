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
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

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
    .min(1, { message: "Please enter a URL" })
    .url({ message: "Please enter a valid URL (e.g., https://example.com)" })
    .refine((url) => !containsAdultContent(url), {
      message: "This type of content is not allowed",
    }),
  customSlug: z
    .string()
    .regex(/^[a-zA-Z0-9-_]*$/, {
      message: "Custom slug can only contain letters, numbers, hyphens, and underscores",
    })
    .max(50, { message: "Custom slug must be 50 characters or less" })
    .optional(),
});

// Form schema for anonymous users
const GuestFormSchema = z.object({
  longUrl: z
    .string()
    .min(1, { message: "Please enter a URL" })
    .url({ message: "Please enter a valid URL (e.g., https://example.com)" })
    .refine((url) => !containsAdultContent(url), {
      message: "This type of content is not allowed",
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
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  // Validate URL as user types
  const validateUrl = (url: string) => {
    if (!url) {
      setIsValidUrl(null);
      return;
    }
    try {
      new URL(url);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
  };

  // Handle manual form submission without react-hook-form
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!longUrlInput) {
      setError("Please enter a URL");
      return;
    }

    try {
      new URL(longUrlInput);
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    if (containsAdultContent(longUrlInput)) {
      setError("This type of content is not allowed");
      return;
    }

    if (customSlugInput && !/^[a-zA-Z0-9-_]*$/.test(customSlugInput)) {
      setError("Custom slug can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    if (customSlugInput && customSlugInput.length > 50) {
      setError("Custom slug must be 50 characters or less");
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

      <form onSubmit={handleManualSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium">URL to shorten</label>
          <div className="relative">
            <Input
              placeholder="https://example.com/very/long/url"
              autoComplete="off"
              className={`border-primary/20 focus-visible:ring-primary/20 w-full pr-10 ${
                isValidUrl === false ? "border-red-500" : 
                isValidUrl === true ? "border-green-500" : ""
              }`}
              value={longUrlInput}
              onChange={(e) => {
                setLongUrlInput(e.target.value);
                validateUrl(e.target.value);
              }}
            />
            {isValidUrl !== null && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidUrl ? (
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <svg className="h-5 w-5 text-red-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      Please enter a valid URL (e.g., https://example.com)
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
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
                placeholder="my-custom-url (letters, numbers, hyphens, underscores)"
                autoComplete="off"
                className="border-primary/20 focus-visible:ring-primary/20 w-full rounded-l-none"
                value={customSlugInput}
                onChange={(e) => setCustomSlugInput(e.target.value)}
              />
            </div>
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
