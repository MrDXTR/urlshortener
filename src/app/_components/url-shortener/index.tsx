"use client";

import { Toaster } from "sonner";
import { UrlShortenerForm } from "./url-form";

export function UrlShortener() {
  return (
    <>
      <Toaster position="top-center" />
      <div className="flex w-full flex-col items-center">
        <UrlShortenerForm />
      </div>
    </>
  );
}
