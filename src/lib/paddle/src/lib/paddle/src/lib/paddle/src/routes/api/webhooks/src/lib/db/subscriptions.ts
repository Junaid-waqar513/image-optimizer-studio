/**
 * src/lib/db/subscriptions.ts
 *
 * Real Supabase implementation, called from the webhook server route at
 * src/routes/api/webhooks/paddle.ts.
 * Assumes a Lovable-generated project using @supabase/supabase-js with a
 * `users` table that has a primary key `id` matching your auth user id,
 * plus the columns referenced below.
 *
 * If your schema differs, adjust column names — the shape of what's
 * written matters more than exact names.
 *
 * Suggested `users` table columns (add via Supabase SQL editor if missing):
 *   id                     uuid / text, PK (matches auth.users.id)
 *   subscription_status    text          ('active' | 'past_due' | 'paused' | 'canceled' | null)
 *   subscription_tier      text          ('starter' | 'pro' | 'advanced' | null)
 *   paddle_subscription_id text
 *   paddle_customer_id     text
 *   scan_allowance         integer default 0
 *   scans_used             integer default 0
 *   current_period_end     timestamptz
 *
 * Requires:
 *   npm install @supabase/supabase-js
 *   SUPABASE_SERVICE_ROLE_KEY env var (server-only — bypasses RLS,
 *   needed because this runs in a webhook with no logged-in user session)
 */

import { createClient } from "@supabase/supabase-js";
import { getTierByPriceId } from "../paddle/config";

// Service-role client: only ever import this file from server code
// (the webhook route). Never expose SUPABASE_SERVICE_ROLE_KEY to the client.
// Note: this runs server-side (Node/Bun), so it reads process.env directly —
// NOT import.meta.env, which is for client-bundled code only.
const supabase = createClient(
  process.env.VITE_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

interface RecordTransactionCompletedInput {
  transactionId: string;
  customerId: string | null;
  subscriptionId: string | null;
  userId: string | null;
  amount: string | null;
  currency: string | null;
  status: string;
}

export async function recordTransactionCompleted(
  input: RecordTransactionCompletedInput
): Promise<void> {
  if (!input.userId) {
    console.warn(`[db] transaction ${input.transactionId} missing userId in customData.`);
    return;
  }

  const { error } = await supabase.from("transactions").upsert(
    {
      paddle_transaction_id: input.transactionId,
      user_id: input.userId,
      amount: input.amount,
      currency: input.currency,
      status: input.status,
    },
    { onConflict: "paddle_transaction_id" }
  );

  if (error) throw error;
}

interface ActivateSubscriptionInput {
  subscriptionId: string;
  customerId: string;
  userId: string | null;
  priceId: string | null;
  status: string;
  currentPeriodEnd: string | null;
}

export async function activateSubscription(
  input: ActivateSubscriptionInput
): Promise<void> {
  if (!input.userId) {
    console.warn(`[db] subscription ${input.subscriptionId} missing userId in customData.`);
    return;
  }

  const tier = input.priceId ? getTierByPriceId(input.priceId) : undefined;

  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: "active",
      subscription_tier: tier?.id ?? null,
      paddle_subscription_id: input.subscriptionId,
      paddle_customer_id: input.customerId,
      scan_allowance: tier?.scanAllowance ?? 0,
      scans_used: 0,
      current_period_end: input.currentPeriodEnd,
    })
    .eq("id", input.userId);

  if (error) throw error;
}

interface UpdateSubscriptionInput {
  subscriptionId: string;
  userId: string | null;
  priceId: string | null;
  status: string;
  currentPeriodEnd: string | null;
  scheduledChange: unknown;
}

export async function updateSubscription(
  input: UpdateSubscriptionInput
): Promise<void> {
  if (!input.userId) {
    console.warn(`[db] subscription ${input.subscriptionId} missing userId in customData.`);
    return;
  }

  const tier = input.priceId ? getTierByPriceId(input.priceId) : undefined;

  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: input.status,
      ...(tier ? { subscription_tier: tier.id, scan_allowance: tier.scanAllowance } : {}),
      current_period_end: input.currentPeriodEnd,
    })
    .eq("id", input.userId);

  if (error) throw error;
}

interface CancelSubscriptionInput {
  subscriptionId: string;
  userId: string | null;
  canceledAt: string;
}

export async function cancelSubscription(
  input: CancelSubscriptionInput
): Promise<void> {
  if (!input.userId) {
    console.warn(`[db] subscription ${input.subscriptionId} missing userId in customData.`);
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: "canceled",
      subscription_tier: null,
      scan_allowance: 0,
    })
    .eq("id", input.userId);

  if (error) throw error;
}
