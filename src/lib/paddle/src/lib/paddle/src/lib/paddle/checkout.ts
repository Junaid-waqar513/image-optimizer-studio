/**
 * src/lib/paddle/checkout.ts
 *
 * Checkout trigger functions — logic is identical to a Next.js version,
 * just without the "use client" directive (not applicable outside
 * Next.js Server Components).
 */

import { getPaddleInstance } from "./client";
import { getTierById, type PricingTier } from "./config";

export interface OpenCheckoutOptions {
  tier: PricingTier;
  userId: string;
  email?: string;
  successUrl?: string;
}

export async function openTierCheckout({
  tier,
  userId,
  email,
  successUrl,
}: OpenCheckoutOptions): Promise<void> {
  const tierDef = getTierById(tier);

  if (!tierDef || !tierDef.priceId) {
    console.error(`[paddle] Cannot open checkout: no Price ID configured for tier "${tier}".`);
    return;
  }

  const paddle = await getPaddleInstance();

  if (!paddle) {
    console.error("[paddle] Paddle.js instance is not available.");
    return;
  }

  paddle.Checkout.open({
    items: [{ priceId: tierDef.priceId, quantity: 1 }],
    customer: email ? { email } : undefined,
    customData: {
      userId,
      tier: tierDef.id,
      app: "expatmail-ai",
    },
    settings: {
      successUrl,
    },
  });
}

export const openStarterCheckout = (opts: Omit<OpenCheckoutOptions, "tier">) =>
  openTierCheckout({ ...opts, tier: "starter" });

export const openProCheckout = (opts: Omit<OpenCheckoutOptions, "tier">) =>
  openTierCheckout({ ...opts, tier: "pro" });

export const openAdvancedCheckout = (opts: Omit<OpenCheckoutOptions, "tier">) =>
  openTierCheckout({ ...opts, tier: "advanced" });
