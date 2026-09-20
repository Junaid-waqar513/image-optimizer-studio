// ─────────────────────────────────────────────────────────────
// src/routes/api/webhooks/paddle.ts
//
// Receives Paddle webhook events, verifies the signature, and updates
// the user's subscription status + scan allowance in Supabase.
//
// URL (determined by file location): POST /api/webhooks/paddle
//
// Required env vars (server-only, no VITE_ prefix):
//   PADDLE_ENVIRONMENT        live | sandbox   (matches paddle-config.functions.ts)
//   PADDLE_API_KEY            server-side API key from Paddle Dashboard
//   PADDLE_WEBHOOK_SECRET     from Paddle Dashboard > Developer tools > Notifications
//   SUPABASE_URL               your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY  service role key (Project Settings > API) — bypasses RLS
//
// Install: bun add @paddle/paddle-node-sdk @supabase/supabase-js
// ─────────────────────────────────────────────────────────────

import { createServerFileRoute } from "@tanstack/react-start/api";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { createClient } from "@supabase/supabase-js";

import { tiers } from "@/lib/tiers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — refusing to run the webhook without it.`);
  }
  return value;
}

const paddleEnvironment = requireEnv("PADDLE_ENVIRONMENT");
if (paddleEnvironment !== "live" && paddleEnvironment !== "sandbox") {
  throw new Error(`PADDLE_ENVIRONMENT must be 'live' or 'sandbox', got '${paddleEnvironment}'.`);
}

const paddle = new Paddle(requireEnv("PADDLE_API_KEY"), {
  environment: paddleEnvironment === "live" ? Environment.production : Environment.sandbox,
});

const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));

/** Finds the tier whose monthly or yearly priceId matches, for scan-allowance lookups. */
function tierForPriceId(priceId: string) {
  return tiers.find((t) => t.priceId.month === priceId || t.priceId.year === priceId);
}

function scanAllowanceFor(tierName: string | undefined): number {
  switch (tierName) {
    case "Starter":
      return 10;
    case "Pro":
    case "Advanced":
      return Number.MAX_SAFE_INTEGER; // unlimited per pricing copy
    default:
      return 0;
  }
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const ServerRoute = createServerFileRoute().methods({
  POST: async ({ request }) => {
    const signature = request.headers.get("paddle-signature") ?? "";
    const webhookSecret = requireEnv("PADDLE_WEBHOOK_SECRET");

    // Raw body required — Paddle's signature is computed over the exact
    // raw bytes, so never JSON.parse before verifying.
    const rawBody = await request.text();
    if (!signature || !rawBody) {
      return jsonResponse({ error: "Missing signature or body" }, 400);
    }

    let event;
    try {
      event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    } catch (error) {
      console.error("[paddle-webhook] Signature verification failed:", error);
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    try {
      switch (event.eventType) {
        case EventName.SubscriptionCreated:
        case EventName.SubscriptionUpdated: {
          const sub = event.data;
          const userId = (sub.customData as { userId?: string } | null)?.userId;
          const priceId = sub.items?.[0]?.price?.id ?? null;
          const tier = priceId ? tierForPriceId(priceId) : undefined;

          if (!userId) {
            console.warn(`[paddle-webhook] subscription ${sub.id} has no userId in customData.`);
            break;
          }

          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: sub.status, // active | past_due | paused | canceled
              subscription_tier: tier?.name ?? null,
              paddle_subscription_id: sub.id,
              paddle_customer_id: sub.customerId,
              scan_allowance: scanAllowanceFor(tier?.name),
              current_period_end: sub.currentBillingPeriod?.endsAt ?? null,
              ...(event.eventType === EventName.SubscriptionCreated ? { scans_used: 0 } : {}),
            })
            .eq("id", userId);

          if (error) throw error;
          break;
        }

        case EventName.SubscriptionCanceled: {
          const sub = event.data;
          const userId = (sub.customData as { userId?: string } | null)?.userId;
          if (!userId) break;

          const { error } = await supabase
            .from("users")
            .update({ subscription_status: "canceled", subscription_tier: null, scan_allowance: 0 })
            .eq("id", userId);

          if (error) throw error;
          break;
        }

        case EventName.TransactionCompleted: {
          const txn = event.data;
          const userId = (txn.customData as { userId?: string } | null)?.userId ?? null;

          const { error } = await supabase.from("transactions").upsert(
            {
              paddle_transaction_id: txn.id,
              user_id: userId,
              amount: txn.details?.totals?.total ?? null,
              currency: txn.currencyCode ?? null,
              status: txn.status,
            },
            { onConflict: "paddle_transaction_id" },
          );

          if (error) throw error;
          break;
        }

        default:
          console.log(`[paddle-webhook] Unhandled event type: ${event.eventType}`);
      }
    } catch (error) {
      console.error(`[paddle-webhook] Error processing ${event.eventType}:`, error);
      // 500 tells Paddle to retry — don't swallow DB failures.
      return jsonResponse({ error: "Internal error processing webhook" }, 500);
    }

    return jsonResponse({ received: true }, 200);
  },
});
