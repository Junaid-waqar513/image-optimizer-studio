import { Check, Sparkles } from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";

const tiers = [
  {
    name: "Starter",
    price: "$10",
    priceId: "pri_01m24yg7mqj9yftbvj5eh9gq1j",
    description: "For occasional letters and first-time expats.",
    features: [
      "10 scans per month",
      "English summary + action steps",
      "Supports DE, FR, IT, ES, NL",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Pro",
    price: "$40",
    priceId: "pri_01m250xea1p4ykngabde08973g",
    description: "For anyone actually living the paperwork.",
    features: [
      "Unlimited scans",
      "Calendar integration for every deadline",
      "AI legal assistant chat",
      "Saved letter archive & reminders",
      "Priority processing",
    ],
    popular: true,
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
    popular: false,
  },
];

export default function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative rounded-2xl border bg-card p-7 ${
            tier.popular ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border"
          }`}
        >
          {tier.popular && (
            <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              <Sparkles className="size-3" /> Most popular
            </span>
          )}
          <p className={`text-sm font-medium ${tier.popular ? "text-primary" : "text-muted-foreground"}`}>
            {tier.name}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            {tier.price}
            <span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {tier.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          <CheckoutButton
            priceId={tier.priceId}
            variant={tier.popular ? "default" : "outline"}
            className="mt-7 w-full"
          >
            {tier.popular ? "Get Pro" : `Choose ${tier.name}`}
          </CheckoutButton>
        </div>
      ))}
    </div>
  );
}
