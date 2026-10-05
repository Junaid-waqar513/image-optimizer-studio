import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/finanzamt-letter")({
  head: () => ({
    meta: [
      { title: "Finanzamt Letter? Get an English Translation & Summary — ExpatMail AI" },
      {
        name: "description",
        content:
          "Confused by a letter from the Finanzamt? Scan it and get a plain-English summary with exactly what action you need to take, in under a minute.",
      },
      { property: "og:title", content: "Finanzamt Letter? Get an English Summary — ExpatMail AI" },
      {
        property: "og:description",
        content:
          "Upload your Finanzamt letter and get a plain-English summary with deadlines and next steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinanzamtLanding,
});

const steps = [
  { title: "Upload the letter", body: "Snap a photo or upload the PDF — no formatting needed." },
  { title: "Get a plain-English summary", body: "See what it says and why it was sent, in under a minute." },
  { title: "Know exactly what to do", body: "Clear next steps, with the deadline if there is one." },
];

const faqs = [
  {
    q: "Is this official or legal advice?",
    a: "No. ExpatMail AI explains what the letter says and suggests next steps, but for anything with real legal or financial weight, confirm with a tax advisor (Steuerberater) or the Finanzamt directly.",
  },
  {
    q: "What languages are supported?",
    a: "German, French, Italian, Spanish, and Dutch today, with more planned.",
  },
  {
    q: "Is my letter kept private?",
    a: "Yes — your scans are only visible to you.",
  },
];

function FinanzamtLanding() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:pt-24">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileText className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Got a Letter From the Finanzamt? <br className="hidden sm:block" />
          Here's What It Actually Says.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          German tax office letters are confusing even for native speakers. ExpatMail AI reads
          yours and tells you, in plain English, what it means and what you need to do — in under
          a minute.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/login" search={{ redirect: "/dashboard" }}>
              Scan your letter free
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/pricing">See plans</Link>
          </Button>
        </div>
      </section>

      {/* Why it's stressful */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Why Finanzamt letters are so stressful
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Germany's tax office sends letters for dozens of reasons — a missing
          Steuererklärung, a correction to a past filing, a request for documents, a refund
          notice. The language is formal, the deadlines are often buried in a single sentence,
          and getting it wrong can mean a fine.
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-center text-xl font-semibold tracking-tight text-foreground">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-5">
              <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Not just German */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
          <Languages className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">Not just German</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dealing with official mail in France, Italy, Spain, or the Netherlands? The same
              tool works for those too.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-6">
          {faqs.map((item) => (
            <div key={item.q}>
              <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-2xl px-4 pb-20 pt-6 text-center">
        <div className="rounded-2xl border border-border bg-card p-8">
          <CheckCircle2 className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            Scan your first letter free
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No card required to try it.
          </p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/login" search={{ redirect: "/dashboard" }}>
              Get started
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
