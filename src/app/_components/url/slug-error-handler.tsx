"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SlugErrorHandler() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const slug = searchParams.get("slug");

  useEffect(() => {
    if (error && slug) {
      // Small delay to ensure toast appears after page load
      setTimeout(() => {
        if (error === "not-found") {
          toast.error("Link not found", {
            description: `The shortened URL "${slug}" doesn't exist or has been removed.`,
          });

          // Clear the URL parameters after showing the toast
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        } else if (error === "invalid-slug") {
          toast.error("Invalid link format", {
            description: `The URL format "${slug}" is not valid.`,
          });

          // Clear the URL parameters after showing the toast
          const newUrl = window.location.pathname;
          window.history.replaceState({}, "", newUrl);
        }
      }, 100);
    }
  }, [error, slug]);

  return null;
}
