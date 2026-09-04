import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import { statusMeta, type Letter } from "@/lib/letters";
import { cn } from "@/lib/utils";

export default function LetterCard({ letter }: { letter: Letter }) {
  const status = statusMeta[letter.status];
  return (
    <Link
      to="/dashboard/letters/$id"
      params={{ id: letter.id }}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-muted text-lg">{letter.flag}</span>
          <div>
            <p className="font-semibold leading-tight text-foreground">{letter.sender}</p>
            <p className="text-xs text-muted-foreground">
              {letter.kind} · {letter.language}
            </p>
          </div>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{letter.summary}</p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", status.className)}>
          {status.label}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="size-3.5" />
          {letter.dateLabel}
        </span>
      </div>
    </Link>
  );
}
