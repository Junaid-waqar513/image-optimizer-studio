import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const free = ["3 scans per month", "English summary + action steps", "Supports DE, FR, IT, ES, NL"];
const premium = [
  "Unlimited scans",
  "Calendar integration for every deadline",
  "AI legal assistant chat",
  "Saved letter archive & reminders",
  "Priority processing",
];

export default function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-7">
        <p className="text-sm font-medium text-muted-foreground">Free</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          $0
          <span className="text-base font-normal text-muted-foreground">/month</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Try it on your next scary envelope.</p>
        <ul className="mt-6 space-y-3 text-sm">
          {free.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="mt-7 w-full">
          <Link to="/dashboard">Start free</Link>
        </Button>
      </div>

      <div className="relative rounded-2xl border border-primary/40 bg-card p-7 shadow-lg shadow-primary/10">
        <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          <Sparkles className="size-3" /> Most popular
        </span>
        <p className="text-sm font-medium text-primary">Premium</p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          $9
          <span className="text-base font-normal text-muted-foreground">/month</span>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">For anyone actually living the paperwork.</p>
        <ul className="mt-6 space-y-3 text-sm">
          {premium.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-7 w-full">
          <Link to="/dashboard/plan">Go Premium</Link>
        </Button>
      </div>
    </div>
  );
}
