import { initializePaddle, type Paddle, type Environments } from "@paddle/paddle-js";

import { getPaddleConfig } from "@/lib/paddle-config.functions";

let paddlePromise: Promise<Paddle> | null = null;

/**
 * Initializes Paddle.js in the browser using the environment and client-side
 * token supplied by the server (see paddle-config.functions.ts). Fails loudly
 * when configuration is missing rather than defaulting to an environment.
 */
export function getPaddle(): Promise<Paddle> {
  if (paddlePromise) return paddlePromise;

  paddlePromise = (async () => {
    const { environment, token } = await getPaddleConfig();

    const paddle = await initializePaddle({
      environment: environment as Environments,
      token,
    });

    if (!paddle) throw new Error("Paddle.js failed to initialize.");
    return paddle;
  })().catch((error: unknown) => {
    paddlePromise = null;
    throw error;
  });

  return paddlePromise;
}
