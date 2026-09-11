// ─────────────────────────────────────────────────────────────
// EDIT THIS FILE to change plans, copy, features or price IDs.
// Price IDs come from your Paddle dashboard (Catalog → Products).
// ─────────────────────────────────────────────────────────────

export type BillingCycle = "month" | "year";

export interface Tier {
  name: "Starter" | "Pro" | "Advanced";
  description: string;
  features: string[];
  popular?: boolean;
  priceId: { month: string; year: string };
}

export const tiers: Tier[] = [
  {
    name: "Starter",
    description: "For occasional letters and first-time expats.",
    features: [
      "10 scans per month",
      "English summary + action steps",
      "Supports DE, FR, IT, ES, NL",
      "Email support",
    ],
    priceId: {
      month: "pri_01m24yg7mqj9yftbvj5eh9gq1j",
      // TODO: replace with your Starter yearly price ID from Paddle
      year: "pri_REPLACE_STARTER_YEARLY",
    },
  },
  {
    name: "Pro",
    description: "For anyone actually living the paperwork.",
    popular: true,
    features: [
      "Unlimited scans",
      "Calendar integration for every deadline",
      "AI legal assistant chat",
      "Saved letter archive & reminders",
      "Priority processing",
    ],
    priceId: {
      month: "pri_01m250xea1p4ykngabde08973g",
      // TODO: replace with your Pro yearly price ID from Paddle
      year: "pri_REPLACE_PRO_YEARLY",
    },
  },
  {
    name: "Advanced",
    description: "For families, teams, or heavy paperwork years.",
    features: [
      "Everything in Pro",
      "Up to 5 users",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    priceId: {
      month: "pri_01m25171dhk8r17524t6e7aam1",
      // TODO: replace with your Advanced yearly price ID from Paddle
      year: "pri_REPLACE_ADVANCED_YEARLY",
    },
  },
];
