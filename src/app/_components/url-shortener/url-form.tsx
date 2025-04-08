"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from "~/components/ui/form";
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
  /nsfw/i
];

// Function to check if URL contains adult content
const containsAdultContent = (url: string) => {
  return adultContentPatterns.some(pattern => pattern.test(url));
};

// Form schema for authenticated users
const AuthFormSchema = z.object({
  longUrl: z.string()
    .url({ message: "Please enter a valid URL" })
    .refine(url => !containsAdultContent(url), {
      message: "URLs containing adult content are not allowed"
    }),
  customSlug: z.string().optional(),
});

// Form schema for anonymous users
const GuestFormSchema = z.object({
  longUrl: z.string()
    .url({ message: "Please enter a valid URL" })
    .refine(url => !containsAdultContent(url), {
      message: "URLs containing adult content are not allowed"
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
  const authForm = useForm<AuthFormType>({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      longUrl: "",
      customSlug: "",
    },
  });
  
  // Form for guest users (without custom slug)
  const guestForm = useForm<GuestFormType>({
    resolver: zodResolver(GuestFormSchema),
    defaultValues: {
      longUrl: "",
    },
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
    toast.success("URL shortened successfully!", {
      description: shortUrl,
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
  const onAuthSubmit = (values: AuthFormType) => {
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

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {session ? (
        // Authenticated user form with custom slug option
        <Form {...authForm}>
          <form onSubmit={authForm.handleSubmit(onAuthSubmit)} className="space-y-5">
            <FormField
              control={authForm.control}
              name="longUrl"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">URL to shorten</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very/long/url"
                      autoComplete="off"
                      className="w-full border-primary/20 focus-visible:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={authForm.control}
              name="customSlug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">Custom URL slug (optional)</FormLabel>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-muted/50 text-muted-foreground px-3 py-2 text-sm border border-r-0 rounded-l-md border-primary/20">
                      {origin}/
                    </div>
                    <FormControl>
                      <Input
                        placeholder="my-custom-url"
                        autoComplete="off"
                        className="w-full rounded-l-none border-primary/20 focus-visible:ring-primary/20"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                  {field.value && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Preview: {origin}/{field.value}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary/90 hover:bg-primary transition-colors"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Shorten URL"}
            </Button>
          </form>
        </Form>
      ) : (
        // Guest user form without custom slug
        <Form {...guestForm}>
          <form onSubmit={guestForm.handleSubmit(onGuestSubmit)} className="space-y-5">
            <FormField
              control={guestForm.control}
              name="longUrl"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-medium">URL to shorten</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/very/long/url"
                      autoComplete="off"
                      className="w-full border-primary/20 focus-visible:ring-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-primary/90 hover:bg-primary transition-colors"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Shorten URL"}
            </Button>
          </form>
        </Form>
      )}

      {shortUrl && (
        <div className="bg-muted/40 rounded-md border border-primary/20 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <p className="text-xs text-muted-foreground mb-1">Your shortened URL:</p>
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
            <div className="mt-3 pt-3 border-t border-primary/10">
              <p className="text-xs text-muted-foreground">
                <Link href="/api/auth/signin" className="text-primary hover:underline">
                  Sign in
                </Link> to create custom URLs and track analytics.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
