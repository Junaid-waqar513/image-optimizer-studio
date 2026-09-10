import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CalendarCheck, Globe2, Languages, ShieldCheck, Sparkles } from "lucide-react";
import UploadDropzone, { type UploadResult } from "@/components/UploadDropzone";
import PricingCards from "@/components/PricingCards";
import { LegalFooterLink } from "@/components/LegalFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExpatMail AI — Understand Foreign Government Letters Instantly" },
      {
        name: "description",
        content:
          "Snap a photo of any official letter in German, French or Italian and get a clear English summary, deadlines and action steps in seconds. Free to try.",
      },
      { property: "og:title", content: "ExpatMail AI — Understand Foreign Government Letters" },
      {
        property: "og:description",
        content:
          "Photo in, plain-English action items out. Never miss a deadline in a language you don't speak yet.",
      },
    ],
  }),
  component: Landing,
});

const countries = ["🇺🇸 US", "🇬🇧 UK", "🇩🇪 Germany", "🇫🇷 France", "🇮🇹 Italy"];

function Landing() {
  const navigate = useNavigate();

  function handleDone(result: UploadResult | { error: string }) {
    if ("error" in result) return;

    navigate({
      to: "/dashboard/letters/$id",
      params: { id: "live" },
      state: {
        imageUrl: result.imageUrl,
        filename: result.file.name,
        analysis: result.analysis,
      } as Record<string, unknown>,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Languages className="size-4" />
            </span>
            <span className="font-semibold tracking-tight text-foreground">ExpatMail AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <Button asChild size="sm">
            <Link to="/dashboard">Open dashboard</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3" /> Built for newly landed expats
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Stop stressing over foreign government mail.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Snap a photo of any official letter — German, French, Italian and more — and instantly get
              a clear English explanation, the real deadline, and the exact action items you need to
              take. No dictionaries, no panicked forum searches.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-3xl">
            <UploadDropzone onDone={handleDone} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {countries.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Three steps, about twelve seconds
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Globe2,
                title: "Snap it with your phone",
                body: "Photograph the letter where you stand — kitchen table, mailroom, anywhere. Language is detected automatically.",
              },
              {
                icon: Languages,
                title: "Get plain English",
                body: "A two-sentence executive summary of what the letter actually means, stripped of bureaucratic wording.",
              },
              {
                icon: CalendarCheck,
                title: "Never miss the deadline",
                body: "Amounts, IBANs and due dates become a checklist you can push straight into your calendar.",
              },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Simple pricing
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Start free. Upgrade when the paperwork starts stacking up.
            </p>
          </div>
          <div className="mt-10">
            <PricingCards />
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            Letters are encrypted in transit and deleted on request.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} ExpatMail AI</span>
          <span>Not legal advice — always verify with the issuing authority.</span>
          <LegalFooterLink />
        </div>
      </footer>
    </div>
  );
}
