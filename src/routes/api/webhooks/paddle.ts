// ─────────────────────────────────────────────────────────────
// src/routes/api/webhooks/paddle.ts   →   POST /api/webhooks/paddle
//
// Verifies Paddle's signature, then syncs subscription state into the
// Supabase `users` table. The user is identified by `customData.userId`,
// which the checkout MUST set (see PricingTable.tsx).
//
// Server-only env vars (no VITE_ prefix):
//   PADDLE_ENVIRONMENT        live | sandbox
//   PADDLE_API_KEY            Paddle → Developer tools → Authentication
//   PADDLE_WEBHOOK_SECRET     Paddle → Developer tools → Notifications (per destination)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY bypasses RLS — server only
// ─────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { createClient } from "@supabase/supabase-js";

import { tiers } from "@/lib/tiers";

// `scan_allowance` is a Postgres integer (max 2,147,483,647). Number.MAX_SAFE_INTEGER
// would make every Pro/Advanced update fail with "out of range for type integer".
const UNLIMITED_SCANS = 2_147_483_647;

const STARTER_SCANS = 10;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — refusing to run the webhook without it.`);
  return value;
}

// Built lazily, per request: on Cloudflare Workers env is only bound at request
// time, so reading process.env at module scope (as before) resolves to undefined.
function getClients() {
  const env = requireEnv("PADDLE_ENVIRONMENT");
  if (env !== "live" && env !== "sandbox") {
    throw new Error(`PADDLE_ENVIRONMENT must be 'live' or 'sandbox', got '${env}'.`);
  }
  const paddle = new Paddle(requireEnv("PADDLE_API_KEY"), {
    environment: env === "live" ? Environment.production : Environment.sandbox,
  });
  const supabase = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
  return { paddle, supabase, webhookSecret: requireEnv("PADDLE_WEBHOOK_SECRET") };
}

function tierForPriceId(priceId: string) {
  return tiers.find((t) => t.priceId.month === priceId || t.priceId.year === priceId);
}

function scanAllowanceFor(tierName: string | undefined): number {
  switch (tierName) {
    case "Starter":
      return STARTER_SCANS;
    case "Pro":
    case "Advanced":
      return UNLIMITED_SCANS;
    default:
      return 0;
  }
}

function userIdFrom(customData: unknown): string | null {
  const id = (customData as { userId?: unknown } | null)?.userId;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/webhooks/paddle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let clients: ReturnType<typeof getClients>;
        try {
          clients = getClients();
        } catch (error) {
          console.error("[paddle-webhook] Misconfigured:", error);
          return json({ error: "Webhook not configured" }, 500);
        }
        const { paddle, supabase, webhookSecret } = clients;

        // Signature is computed over the exact raw bytes — read text, don't parse first.
        const signature = request.headers.get("paddle-signature") ?? "";
        const rawBody = await request.text();
        if (!signature || !rawBody) return json({ error: "Missing signature or body" }, 400);

        let event;
        try {
          event = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
        } catch (error) {
          console.error("[paddle-webhook] Signature verification failed:", error);
          return json({ error: "Invalid signature" }, 401);
        }
        if (!event) return json({ error: "Invalid payload" }, 400);

        try {
          switch (event.eventType) {
            case EventName.SubscriptionCreated:
            case EventName.SubscriptionUpdated: {
              const sub = event.data;
              const userId = userIdFrom(sub.customData);
              if (!userId) {
                // 200 on purpose: retrying can never fix a missing userId. Log loudly instead.
                console.error(`[paddle-webhook] subscription ${sub.id} has no customData.userId — NOT linked to a user.`);
                break;
              }

              const priceId = sub.items?.[0]?.price?.id ?? null;
              const tier = priceId ? tierForPriceId(priceId) : undefined;
              if (!tier) {
                console.error(`[paddle-webhook] subscription ${sub.id}: price ${priceId} matches no tier in tiers.ts.`);
              }

              const { error } = await supabase
                .from("users")
                .update({
                  subscription_status: sub.status, // active | trialing | past_due | paused | canceled
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
              const userId = userIdFrom(sub.customData);
              if (!userId) {
                console.error(`[paddle-webhook] canceled subscription ${sub.id} has no customData.userId.`);
                break;
              }
              const { error } = await supabase
                .from("users")
                .update({ subscription_status: "canceled", subscription_tier: null, scan_allowance: 0 })
                .eq("id", userId);
              if (error) throw error;
              break;
            }

            case EventName.TransactionCompleted: {
              const txn = event.data;
              const userId = userIdFrom(txn.customData);

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

              // "10 scans per month": reset usage when a renewal is paid.
              // (First payment is already covered by SubscriptionCreated.)
              if (userId && txn.origin === "subscription_recurring") {
                const { error: resetError } = await supabase
                  .from("users")
                  .update({ scans_used: 0 })
                  .eq("id", userId);
                if (resetError) throw resetError;
              }
              break;
            }

            default:
              console.log(`[paddle-webhook] Unhandled event type: ${event.eventType}`);
          }
        } catch (error) {
          console.error(`[paddle-webhook] Error processing ${event.eventType}:`, error);
          // 500 makes Paddle retry — don't swallow DB failures.
          return json({ error: "Internal error processing webhook" }, 500);
        }

        return json({ received: true }, 200);
      },
    },
  },
});
