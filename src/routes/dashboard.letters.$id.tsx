import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarPlus, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getLetter, statusMeta } from "@/lib/letters";

export const Route = createFileRoute("/dashboard/letters/$id")({
  loader: ({ params }) => {
    const letter = getLetter(params.id);
    if (!letter) throw notFound();
    return { letter };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Letter unavailable — ExpatMail AI" }, { name: "robots", content: "noindex" }] };
    }
    const { letter } = loaderData;
    const title = `${letter.sender} (${letter.kind}) — ExpatMail AI`;
    return {
      meta: [
        { title },
        { name: "description", content: letter.summary.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: letter.summary.slice(0, 155) },
      ],
    };
  },
  component: LetterDetail,
});

type ChatMessage = { role: "user" | "assistant"; text: string };

function LetterDetail() {
  const { letter } = Route.useLoaderData();
  const status = statusMeta[letter.status];
  const [steps, setSteps] = useState(letter.steps);
  const [added, setAdded] = useState(false);
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: `I've read your ${letter.language} letter from ${letter.sender}. Ask me anything — what happens if you pay late, how to appeal, or what a term means.`,
    },
  ]);

  const done = steps.filter((s) => s.done).length;

  function toggle(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  }

  function send() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setChat((prev) => [
      ...prev,
      { role: "user", text: q },
      {
        role: "assistant",
        text: `Based on this letter: ${letter.sender} expects the steps above to be completed by ${letter.deadline}. If you miss it, they typically send a reminder with a small late fee before any enforcement — you can also request an extension in writing.`,
      },
    ]);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-muted text-xl">{letter.flag}</span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {letter.sender} <span className="text-muted-foreground">({letter.kind})</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            {letter.country} · Original language: {letter.language} · Scanned {letter.dateLabel}
          </p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", status.className)}>
          {status.label}
        </span>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="px-1 pb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Original document
          </p>
          <img
            src={letter.image}
            alt={`Scanned ${letter.language} letter from ${letter.sender}`}
            width={1024}
            height={1280}
            loading="lazy"
            className="w-full rounded-xl border border-border object-cover"
          />
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" /> Executive summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{letter.summary}</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-foreground">Next steps</h2>
              <span className="text-xs text-muted-foreground">
                {done}/{steps.length} done
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {steps.map((s) => (
                <li key={s.id} className="flex items-start gap-3">
                  <Checkbox
                    id={s.id}
                    checked={s.done}
                    onCheckedChange={() => toggle(s.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={s.id}
                    className={cn(
                      "cursor-pointer text-sm leading-relaxed text-foreground",
                      s.done && "text-muted-foreground line-through",
                    )}
                  >
                    {s.label}
                  </label>
                </li>
              ))}
            </ul>

            <Button
              variant={added ? "outline" : "default"}
              className="mt-5 w-full"
              onClick={() => setAdded(true)}
            >
              <CalendarPlus className="size-4" />
              {added ? `Added: ${letter.calendarTitle}` : "Add to Google Calendar"}
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">
              Ask follow-up questions about this letter
            </h2>
            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "ml-auto bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What happens if I pay late?"
              />
              <Button type="submit" size="icon" aria-label="Send question">
                <Send className="size-4" />
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
