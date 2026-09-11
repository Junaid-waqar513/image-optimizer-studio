import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome aboard — ExpatMail AI" },
      {
        name: "description",
        content:
          "Your ExpatMail AI subscription is active. Start scanning official letters and get plain-English action steps.",
      },
      { property: "og:title", content: "Welcome aboard — ExpatMail AI" },
      {
        property: "og:description",
        content: "Your subscription is active — scan your first letter now.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          You're all set
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your subscription is active. Scan your first letter and get a plain-English summary with
          every deadline and action step.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/pricing">View plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
