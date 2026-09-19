/**
 * src/lib/paddle/client.ts
 *
 * Client-side Paddle.js (v2) init for a Vite/TanStack Start app.
 * No "use client" directive needed here — that's a Next.js Server
 * Components concept and doesn't apply to TanStack Start.
 *
 * Install: bun add @paddle/paddle-js
 */

import { initializePaddle, type Paddle, type Environment } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle | undefined> | null = null;

export function getPaddleInstance(): Promise<Paddle | undefined> {
  if (typeof window === "undefined") {
    return Promise.resolve(undefined);
  }

  if (!paddlePromise) {
    const clientToken = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
    const environment = (import.meta.env.VITE_PADDLE_ENV ?? "sandbox") as Environment;

    if (!clientToken) {
      console.error(
        "[paddle] VITE_PADDLE_CLIENT_TOKEN is not set. Paddle.js cannot be initialized."
      );
      return Promise.resolve(undefined);
    }

    paddlePromise = initializePaddle({
      environment,
      token: clientToken,
      checkout: {
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      },
    }).catch((error) => {
      console.error("[paddle] Failed to initialize Paddle.js:", error);
      return undefined;
    });
  }

  return paddlePromise;
}
