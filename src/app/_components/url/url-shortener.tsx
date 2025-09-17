"use client";

import { UrlShortenerForm } from "./components/url-form";

export function UrlShortener() {
  return (
    <div className="flex w-full flex-col items-center">
      <UrlShortenerForm />
    </div>
  );
}
