import { createFileRoute } from "@tanstack/react-router";
import { Check, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/plan")({
  head: () => ({
    meta: [
      { title: "My Plan — ExpatMail AI" },
      {
        name: "description",
        content:
          "Manage your ExpatMail AI subscription: unlimited scans, calendar sync and the AI legal assistant for $9/month.",
      },
      { property: "og:title", content: "My Plan — ExpatMail AI" },
      { property: "og:description", content: "Upgrade to unlimited scans, calendar sync and AI chat." },
    ],
  }),
  component: MyPlan,
});

const perks = [
  "Unlimited letter scans",
  "One-click calendar deadlines",
  "AI legal assistant chat",
  "Unlimited saved archive",
  "Priority support",
];

function MyPlan() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">My plan</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You are on the Free plan — 2 of 3 scans used this month.
      </p>

      <div className="mt-7 overflow-hidden rounded-3xl border border-primary/30 bg-card shadow-xl shadow-primary/10">
        <div className="bg-primary/10 px-6 py-5 sm:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            <Sparkles className="size-3" /> Premium
          </span>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            $9<span className="text-base font-normal text-muted-foreground">/month</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cancel anytime. No paperwork, ironically.</p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-7 rounded-xl border border-border bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between text-foreground">
              <span>Premium monthly</span>
              <span className="font-medium">$9.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-muted-foreground">
              <span>VAT (calculated at checkout)</span>
              <span>—</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-medium text-foreground">
              <span>Total today</span>
              <span>$9.00</span>
            </div>
          </div>

          <Button size="lg" className="mt-6 w-full">
            Upgrade via Paddle Checkout
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Secure checkout — demo placeholder, no card charged.
          </p>
        </div>
      </div>
    </div>
  );
}
