import { initializePaddle, type Paddle, type Environments } from "@paddle/paddle-js";

/**
 * Client-side Paddle bootstrap.
 * Both values come from env vars — never hard-coded, never defaulted.
 *   VITE_PADDLE_ENVIRONMENT = live | sandbox
 *   VITE_PADDLE_CLIENT_TOKEN = live_... (or test_... on sandbox)
 * Only the *client-side* token belongs here. A Paddle API key must never
 * appear in browser code.
 */
function readEnv() {
  const environment = import.meta.env.VITE_PADDLE_ENVIRONMENT as string | undefined;
  const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;

  if (!environment) {
    throw new Error(
      "VITE_PADDLE_ENVIRONMENT is not set. Set it to 'live' or 'sandbox' — refusing to guess.",
    );
  }
  if (environment !== "live" && environment !== "sandbox") {
    throw new Error(`VITE_PADDLE_ENVIRONMENT must be 'live' or 'sandbox', got '${environment}'.`);
  }
  if (!token) {
    throw new Error("VITE_PADDLE_CLIENT_TOKEN is not set.");
  }
  if (environment === "live" && !token.startsWith("live_")) {
    throw new Error("VITE_PADDLE_ENVIRONMENT is 'live' but VITE_PADDLE_CLIENT_TOKEN is not a live_ token.");
  }

  return { environment: environment as Environments, token };
}

let paddlePromise: Promise<Paddle> | null = null;

export function getPaddle(): Promise<Paddle> {
  if (paddlePromise) return paddlePromise;

  const { environment, token } = readEnv();

  paddlePromise = initializePaddle({ environment, token }).then((paddle) => {
    if (!paddle) throw new Error("Paddle.js failed to initialize.");
    return paddle;
  });

  return paddlePromise;
}
