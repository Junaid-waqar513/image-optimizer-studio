/**
 * src/routes/api/webhooks/paddle.ts
 *
 * Paddle webhook handler for TanStack Start (file-based server route).
 * This file's LOCATION determines its URL: src/routes/api/webhooks/paddle.ts
 * -> POST https://your-domain/api/webhooks/paddle
 *
 * Uses createServerFileRoute().methods({...}) — the current TanStack
 * Start server-route API (post Vinxi->Vite migration).
 *
 * Install: bun add @paddle/paddle-node-sdk
 *
 * Env vars (server-side, no VITE_ prefix — see .env.example):
 *   PADDLE_API_KEY
 *   PADDLE_WEBHOOK_SECRET
 *   PADDLE_ENVIRONMENT
 */

import { createServerFileRoute } from "@tanstack/react-start/api";
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";

import {
  activateSubscription,
  recordTransactionCompleted,
  updateSubscription,
  cancelSubscription,
} from "../../../lib/db/subscriptions";

const paddle = new Paddle(process.env.PADDLE_API_KEY ?? "", {
  environment:
    process.env.PADDLE_ENVIRONMENT === "production"
      ? Environment.production
      : Environment.sandbox,
});

export const ServerRoute = createServerFileRoute().methods({
  POST: async ({ request }) => {
    const signature = request.headers.get("paddle-signature") ?? "";
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[paddle-webhook] PADDLE_WEBHOOK_SECRET is not configured.");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Raw text body — Paddle's signature is computed over the exact raw
    // bytes, so never JSON.parse before verifying.
    const rawBody = await request.text();

    if (!signature || !rawBody) {
      return new Response(JSON.stringify({ error: "Missing signature or body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let eventData;
    try {
      eventData = await paddle.webhooks.unmarshal(rawBody, webhookSecret, signature);
    } catch (error) {
      console.error("[paddle-webhook] Signature verification failed:", error);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      switch (eventData.eventType) {
        case EventName.TransactionCompleted: {
          const transaction = eventData.data;
          await recordTransactionCompleted({
            transactionId: transaction.id,
            customerId: transaction.customerId ?? null,
            subscriptionId: transaction.subscriptionId ?? null,
            userId: (transaction.customData as { userId?: string } | null)?.userId ?? null,
            amount: transaction.details?.totals?.total ?? null,
            currency: transaction.currencyCode ?? null,
            status: transaction.status,
          });
          break;
        }

        case EventName.SubscriptionCreated: {
          const subscription = eventData.data;
          await activateSubscription({
            subscriptionId: subscription.id,
            customerId: subscription.customerId,
            userId: (subscription.customData as { userId?: string } | null)?.userId ?? null,
            priceId: subscription.items?.[0]?.price?.id ?? null,
            status: subscription.status,
            currentPeriodEnd: subscription.currentBillingPeriod?.endsAt ?? null,
          });
          break;
        }

        case EventName.SubscriptionUpdated: {
          const subscription = eventData.data;
          await updateSubscription({
            subscriptionId: subscription.id,
            userId: (subscription.customData as { userId?: string } | null)?.userId ?? null,
            priceId: subscription.items?.[0]?.price?.id ?? null,
            status: subscription.status,
            currentPeriodEnd: subscription.currentBillingPeriod?.endsAt ?? null,
            scheduledChange: subscription.scheduledChange ?? null,
          });
          break;
        }

        case EventName.SubscriptionCanceled: {
          const subscription = eventData.data;
          await cancelSubscription({
            subscriptionId: subscription.id,
            userId: (subscription.customData as { userId?: string } | null)?.userId ?? null,
            canceledAt: subscription.canceledAt ?? new Date().toISOString(),
          });
          break;
        }

        default: {
          console.log(`[paddle-webhook] Unhandled event type: ${eventData.eventType}`);
        }
      }
    } catch (error) {
      console.error(
        `[paddle-webhook] Error processing event "${eventData.eventType}":`,
        error
      );
      return new Response(JSON.stringify({ error: "Internal error processing webhook" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
});
