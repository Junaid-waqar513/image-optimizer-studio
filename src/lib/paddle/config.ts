/**
 * src/lib/paddle/config.ts
 *
 * TanStack Start / Vite version. Vite exposes client-side env vars via
 * import.meta.env with a VITE_ prefix (NOT process.env.NEXT_PUBLIC_ —
 * that's a Next.js-only convention).
 */

export type PricingTier = "starter" | "pro" | "advanced";

export interface TierDefinition {
  id: PricingTier;
  name: string;
  priceId: string;
  scanAllowance: number;
  isUnlimited: boolean;
}

const env = import.meta.env.VITE_PADDLE_ENV ?? "sandbox";

const PRICE_IDS: Record<PricingTier, { sandbox: string; production: string }> = {
  starter: {
    sandbox: import.meta.env.VITE_PADDLE_PRICE_STARTER_SANDBOX ?? "",
    production: import.meta.env.VITE_PADDLE_PRICE_STARTER_PRODUCTION ?? "",
  },
  pro: {
    sandbox: import.meta.env.VITE_PADDLE_PRICE_PRO_SANDBOX ?? "",
    production: import.meta.env.VITE_PADDLE_PRICE_PRO_PRODUCTION ?? "",
  },
  advanced: {
    sandbox: import.meta.env.VITE_PADDLE_PRICE_ADVANCED_SANDBOX ?? "",
    production: import.meta.env.VITE_PADDLE_PRICE_ADVANCED_PRODUCTION ?? "",
  },
};

function resolvePriceId(tier: PricingTier): string {
  const entry = PRICE_IDS[tier];
  const priceId = env === "production" ? entry.production : entry.sandbox;

  if (!priceId && typeof window !== "undefined") {
    console.warn(
      `[paddle] Missing price ID for tier "${tier}" in "${env}" environment. ` +
        `Check your VITE_PADDLE_PRICE_* environment variables.`
    );
  }

  return priceId;
}

export const PRICING_TIERS: TierDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    priceId: resolvePriceId("starter"),
    scanAllowance: 10, // matches "10 scans per month" copy on the live pricing page
    isUnlimited: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceId: resolvePriceId("pro"),
    // Live site advertises "Unlimited scans" — check isUnlimited in your
    // usage-gating logic instead of relying on scanAllowance's number.
    scanAllowance: Number.MAX_SAFE_INTEGER,
    isUnlimited: true,
  },
  {
    id: "advanced",
    name: "Advanced",
    priceId: resolvePriceId("advanced"),
    scanAllowance: Number.MAX_SAFE_INTEGER,
    isUnlimited: true,
  },
];

export function getTierByPriceId(priceId: string): TierDefinition | undefined {
  return PRICING_TIERS.find((tier) => tier.priceId === priceId);
}

export function getTierById(tierId: PricingTier): TierDefinition | undefined {
  return PRICING_TIERS.find((tier) => tier.id === tierId);
}
