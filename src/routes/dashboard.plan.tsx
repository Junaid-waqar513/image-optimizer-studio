import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";

export const Route = createFileRoute("/dashboard/plan")({
  head: () => ({
    meta: [
      { title: "My Plan — ExpatMail AI" },
      {
        name: "description",
        content:
          "Manage your ExpatMail AI subscription: Starter, Pro and Advanced plans with unlimited scans, calendar sync and AI chat.",
      },
      { property: "og:title", content: "My Plan — ExpatMail AI" },
      { property: "og:description", content: "Upgrade to unlimited scans, calendar sync and AI chat." },
    ],
  }),
  component: MyPlan,
});

const tiers = [
  {
    name: "Starter",
    price: "$10",
    priceId: "pri_01m24yg7mqj9yftbvj5eh9gq1j",
    description: "10 scans/month for occasional letters.",
    features: [
      "10 scans per month",
      "English summary + action steps",
      "Supports DE, FR, IT, ES, NL",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$40",
    priceId: "pri_01m250xea1p4ykngabde08973g",
    description: "Unlimited scans and AI assistant.",
    features: [
      "Unlimited letter scans",
      "One-click calendar deadlines",
      "AI legal assistant chat",
      "Unlimited saved archive",
      "Priority support",
    ],
  },
  {
    name: "Advanced",
    price: "$120",
    priceId: "pri_01m25171dhk8r17524t6e7aam1",
    description: "For families, teams, or heavy paperwork years.",
    features: [
      "Everything in Pro",
      "Up to 5 users",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
  },
];

function MyPlan() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Choose your plan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Start free, upgrade when you're ready. All paid plans include a 7-day free trial.
      </p>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const isPro = tier.name === "Pro";
          return (
            <div
              key={tier.name}
              className={`relative rounded-3xl border bg-card p-6 ${
                isPro ? "border-primary/30 shadow-xl shadow-primary/10" : "border-border"
              }`}
            >
              {isPro && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p className={`text-sm font-medium ${isPro ? "text-primary" : "text-muted-foreground"}`}>
                {tier.name}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                {tier.price}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                priceId={tier.priceId}
                variant={isPro ? "default" : "outline"}
                className="mt-6 w-full"
                size="lg"
              >
                {isPro ? "Start Pro trial" : `Choose ${tier.name}`}
              </CheckoutButton>
            </div>
          );
        })}
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Secure checkout via Paddle. Cancel anytime.
      </p>
    </div>
  );
}
