import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Regex patterns to block adult content URLs
const adultContentPatterns = [
  /porn/i,
  /xxx/i,
  /adult/i,
  /sex/i,
  /escort/i,
  /nsfw/i,
];

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Adds https:// to URLs that don't have a protocol.
 */
export function normalizeUrl(url: string): string {
  url = url.trim();

  if (url.startsWith("www.")) {
    return `https://${url}`;
  }

  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Checks if a hostname is valid.
 */
function isValidHostname(hostname: string): boolean {
  if (hostname === "localhost") return true;

  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(hostname)) {
    const parts = hostname.split(".");
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }

  if (hostname.includes(":")) {
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(hostname);
  }

  // Less restrictive domain validation that accepts development domains
  const domainRegex =
    /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9-]{1,})+$/;
  return domainRegex.test(hostname);
}

/**
 * Validates a URL.
 */
export function validateUrl(url: string): UrlValidationResult {
  if (!url || url.trim() === "") {
    return { isValid: false, error: "Please enter a URL" };
  }

  if (/\s/.test(url)) {
    return { isValid: false, error: "URL cannot contain spaces" };
  }

  try {
    const normalizedUrl = normalizeUrl(url);
    const parsedUrl = new URL(normalizedUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return { isValid: false, error: "URL must use http:// or https://" };
    }

    if (!parsedUrl.hostname || !isValidHostname(parsedUrl.hostname)) {
      return { isValid: false, error: "Invalid domain name" };
    }

    if (adultContentPatterns.some((pattern) => pattern.test(normalizedUrl))) {
      return { isValid: false, error: "This type of content is not allowed" };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: "Please enter a valid URL" };
  }
}
