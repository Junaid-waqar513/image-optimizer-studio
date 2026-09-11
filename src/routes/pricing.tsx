import { createFileRoute, Link } from "@tanstack/react-router";
import { Languages, ShieldCheck } from "lucide-react";

import PricingTable from "@/components/PricingTable";
import { LegalFooterLink } from "@/components/LegalFooter";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ExpatMail AI Letter Translation Plans" },
      {
        name: "description",
        content:
          "Starter, Pro and Advanced plans for translating official government letters into plain English. Local currency pricing, monthly or yearly.",
      },
      { property: "og:title", content: "Pricing — ExpatMail AI" },
      {
        property: "og:description",
        content: "Pick a plan in your local currency and start decoding official mail today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="size-4" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">ExpatMail AI</span>
          </Link>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Plans priced for where you live
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Prices are shown in your local currency, taxes included where applicable.
          </p>
        </div>

        <div className="mt-12">
          <PricingTable />
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          Secure checkout by Paddle, our merchant of record. Cancel anytime.
        </p>

        <div className="mt-6 flex justify-center">
          <LegalFooterLink />
        </div>
      </main>
    </div>
  );
}
