import { createFileRoute } from "@tanstack/react-router";
import UploadDropzone from "@/components/UploadDropzone";
import LetterCard from "@/components/LetterCard";
import { letters } from "@/lib/letters";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ExpatMail AI" },
      {
        name: "description",
        content: "Scan a new official letter and review your recent translated documents and deadlines.",
      },
      { property: "og:title", content: "ExpatMail AI Dashboard" },
      { property: "og:description", content: "Scan new letters and track every deadline in one place." },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Guten Tag, Alex 👋
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One letter needs your attention today. Everything else is handled.
        </p>
      </header>

      <section className="mt-7 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-foreground">Scan new document</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Photograph the letter or drop a file — we detect the language automatically.
        </p>
        <div className="mt-4">
          <UploadDropzone compact label="Drop a photo of your letter here" hint="1 free scan left this month" />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-foreground">Your recent letters</h2>
          <span className="text-xs text-muted-foreground">{letters.length} documents</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {letters.map((letter) => (
            <LetterCard key={letter.id} letter={letter} />
          ))}
        </div>
      </section>
    </div>
  );
}
