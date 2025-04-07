"use client";

import { Toaster } from "sonner";
import { useSession } from "next-auth/react";
import { UrlShortenerForm } from "./url-form";
import { UserUrlList } from "./url-list";

export function UrlShortener() {
  const { data: session } = useSession();

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col items-center w-full">
        <UrlShortenerForm />
        {session?.user && <UserUrlList />}
      </div>
    </>
  );
} 