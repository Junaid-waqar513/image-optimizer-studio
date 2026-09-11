import { createServerFn } from "@tanstack/react-start";

/**
 * Paddle client-side configuration, read from env vars on the server and handed
 * to the browser. Only the *client-side* token is exposed here (it is designed
 * to be public). A Paddle server API key must never be returned to the client.
 *
 *   PADDLE_ENVIRONMENT   = live | sandbox   (required — never defaulted)
 *   PADDLE_CLIENT_TOKEN  = live_... on live, test_... on sandbox
 */
export const getPaddleConfig = createServerFn({ method: "GET" }).handler(async () => {
  const environment = process.env["PADDLE_ENVIRONMENT"];
  const token = process.env["PADDLE_CLIENT_TOKEN"];

  if (!environment) {
    throw new Error(
      "PADDLE_ENVIRONMENT is not set. Set it to 'live' or 'sandbox' — refusing to guess which Paddle account to use.",
    );
  }
  if (environment !== "live" && environment !== "sandbox") {
    throw new Error(`PADDLE_ENVIRONMENT must be 'live' or 'sandbox', got '${environment}'.`);
  }
  if (!token) {
    throw new Error("PADDLE_CLIENT_TOKEN is not set.");
  }
  if (environment === "live" && !token.startsWith("live_")) {
    throw new Error(
      "PADDLE_ENVIRONMENT is 'live' but PADDLE_CLIENT_TOKEN is not a live_ token — refusing to run against the wrong account.",
    );
  }

  return { environment, token };
});
