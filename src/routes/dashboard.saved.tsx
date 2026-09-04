import { createFileRoute } from "@tanstack/react-router";
import LetterCard from "@/components/LetterCard";
import { letters } from "@/lib/letters";

export const Route = createFileRoute("/dashboard/saved")({
  head: () => ({
    meta: [
      { title: "Saved Scans — ExpatMail AI" },
      {
        name: "description",
        content: "Your archive of translated official letters, deadlines and completed action steps.",
      },
      { property: "og:title", content: "Saved Scans — ExpatMail AI" },
      { property: "og:description", content: "Every letter you scanned, summarised and searchable." },
    ],
  }),
  component: SavedScans,
});

function SavedScans() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Saved scans</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything you have scanned, kept in one place with its action steps.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {letters.map((letter) => (
          <LetterCard key={letter.id} letter={letter} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Premium keeps an unlimited archive with automatic deadline reminders.
      </div>
    </div>
  );
}
