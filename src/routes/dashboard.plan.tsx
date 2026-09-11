import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import PricingTable from "@/components/PricingTable";

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
      {
        property: "og:description",
        content: "Upgrade to unlimited scans, calendar sync and AI chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyPlan,
});

function MyPlan() {
  // When you wire up auth, pass the signed-in address so Paddle prefills it:
  // <PricingTable customerEmail={user.email} />
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Choose your plan
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Prices are shown in your local currency. Switch between monthly and yearly below.
      </p>

      <div className="mt-8">
        <PricingTable />
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Secure checkout via Paddle. Cancel anytime.
      </p>
    </div>
  );
}
