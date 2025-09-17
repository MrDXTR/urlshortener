"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { validateUrl, normalizeUrl } from "~/lib/utils";

// Schema for authenticated users
const AuthFormSchema = z.object({
  longUrl: z
    .string()
    .min(1, { message: "Please enter a URL" })
    .superRefine((url, ctx) => {
      const validation = validateUrl(url);
      if (!validation.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: validation.error || "Invalid URL",
        });
      }
      return validation.isValid;
    })
    .transform((url) => normalizeUrl(url)),
  customSlug: z
    .string()
    .regex(/^[a-zA-Z0-9-_]*$/, {
      message:
        "Custom slug can only contain letters, numbers, hyphens, and underscores",
    })
    .max(50, { message: "Custom slug must be 50 characters or less" })
    .optional(),
});

// Schema for guest users
const GuestFormSchema = z.object({
  longUrl: z
    .string()
    .min(1, { message: "Please enter a URL" })
    .superRefine((url, ctx) => {
      const validation = validateUrl(url);
      if (!validation.isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: validation.error || "Invalid URL",
        });
      }
      return validation.isValid;
    })
    .transform((url) => normalizeUrl(url)),
});

type AuthFormType = z.infer<typeof AuthFormSchema>;
type GuestFormType = z.infer<typeof GuestFormSchema>;

export function UrlShortenerForm() {
  const { data: session } = useSession();
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [longUrlInput, setLongUrlInput] = useState("");
  const [customSlugInput, setCustomSlugInput] = useState("");
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [tooltipError, setTooltipError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Debounces the URL validation
  const debouncedValidateUrl = useCallback(
    debounce((url: string) => {
      if (!url) {
        setIsValidUrl(null);
        setTooltipError(null);
        return;
      }
      const validation = validateUrl(url);
      setIsValidUrl(validation.isValid);
      setTooltipError(validation.error ?? null);
      setIsTyping(false);
    }, 500),
    [],
  );

  // Debounce function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function (...args: Parameters<T>): void {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const authForm = useForm<AuthFormType>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      longUrl: "",
      customSlug: "",
    },
    mode: "onSubmit",
  });

  const guestForm = useForm<GuestFormType>({
    resolver: zodResolver(GuestFormSchema),
    defaultValues: {
      longUrl: "",
    },
    mode: "onSubmit",
  });

  const form = session ? authForm : guestForm;

  const utils = api.useUtils();

  const createUrl = api.url.create.useMutation({
    onSuccess: (data) => {
      void utils.url.getUserUrls.invalidate();
      void utils.url.getUserStats.invalidate();
      handleSuccess(data);
    },
    onError: handleError,
  });

  const createAnonUrl = api.url.createAnon.useMutation({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  function handleSuccess(data: { slug: string }) {
    const shortUrl = `${origin}/${data.slug}`;
    setShortUrl(shortUrl);
    setError(null);
    setShowAlert(false);

    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        toast.success("URL shortened and copied to clipboard!", {
          description: shortUrl,
        });
      })
      .catch(() => {
        toast.success("URL shortened successfully!", {
          description: shortUrl,
        });
      });

    form.reset();
    setIsCreating(false);
  }

  function handleError(error: { message: string }) {
    setError(error.message);
    setShowAlert(true);
    toast.error("Error shortening URL", {
      description: error.message,
    });
    setIsCreating(false);
  }

  function validateUrlInput(url: string) {
    setIsTyping(true);
    debouncedValidateUrl(url);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowAlert(true);

    const urlValidation = validateUrl(longUrlInput);
    if (!urlValidation.isValid) {
      setError(urlValidation.error ?? "Invalid URL");
      return;
    }

    if (customSlugInput && !/^[a-zA-Z0-9-_]*$/.test(customSlugInput)) {
      setError(
        "Custom slug can only contain letters, numbers, hyphens, and underscores",
      );
      return;
    }

    if (customSlugInput && customSlugInput.length > 50) {
      setError("Custom slug must be 50 characters or less");
      return;
    }

    setIsCreating(true);
    setShortUrl(null);
    setError(null);

    const normalizedUrl = normalizeUrl(longUrlInput);

    if (session) {
      createUrl.mutate({
        url: normalizedUrl,
        customSlug: customSlugInput || undefined,
      });
    } else {
      createAnonUrl.mutate({
        url: normalizedUrl,
      });
    }
  }

  function copyToClipboard() {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl).then(() => {
      toast.success("Copied to clipboard!");
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {error && showAlert && (
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
              id="url-input"
              placeholder="www.example.com or https://example.com"
              autoComplete="off"
              className={`border-primary/20 focus-visible:ring-primary/20 w-full pr-10 ${
                isValidUrl === false && !isTyping
                  ? "border-red-500"
                  : isValidUrl === true && !isTyping
                    ? "border-green-500"
                    : ""
              }`}
              value={longUrlInput}
              onChange={(e) => {
                setLongUrlInput(e.target.value);
                validateUrlInput(e.target.value);
                setShowAlert(false);
              }}
            />
            {isValidUrl !== null && !isTyping && (
              <div className="absolute top-1/2 right-3 -translate-y-1/2">
                {isValidUrl ? (
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <svg
                        className="h-5 w-5 cursor-help text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </TooltipTrigger>
                    <TooltipContent>
                      {tooltipError || "Please enter a valid URL"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          {isValidUrl === false && !isTyping && tooltipError && (
            <p className="mt-1 block px-1 text-xs text-red-500 sm:hidden">
              {tooltipError}
            </p>
          )}
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
