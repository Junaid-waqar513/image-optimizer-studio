import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Two-letter country code detected server-side from the request headers.
 * Returns null when no header is present — the client then omits the country
 * entirely so Paddle auto-detects location from the visitor's IP.
 */
export const getVisitorCountry = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequest().headers;

  const candidate =
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    headers.get("fastly-client-country") ??
    null;

  if (!candidate) return { country: null as string | null };

  const code = candidate.trim().toUpperCase();

  // Cloudflare uses these sentinels for "unknown" — keep them app-side only,
  // never forward them to Paddle as a country code.
  if (code === "XX" || code === "T1" || code === "OTHERS" || code.length !== 2) {
    return { country: null as string | null };
  }

  return { country: code as string | null };
});
