import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({
    meta: [
      { title: "Support — ExpatMail AI" },
      {
        name: "description",
        content: "Get help with a letter, your subscription or a scan that needs a human second opinion.",
      },
      { property: "og:title", content: "Support — ExpatMail AI" },
      { property: "og:description", content: "Reach the ExpatMail AI team for help with any letter." },
    ],
  }),
  component: Support,
});

const faqs = [
  {
    q: "Which languages do you support?",
    a: "German, French, Italian, Spanish, Dutch and Portuguese letters, always explained back to you in English.",
  },
  {
    q: "Is this legal advice?",
    a: "No. We explain what the letter says and what it asks you to do. For disputes we can point you to a local advisor.",
  },
  {
    q: "What happens to my documents?",
    a: "They are encrypted in transit, stored only in your archive, and deleted permanently whenever you ask.",
  },
];

function Support() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Support</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Typical reply time is under 4 hours on weekdays.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <MessageCircle className="size-5 text-primary" />
          <p className="mt-3 font-medium text-foreground">Live chat</p>
          <p className="mt-1 text-sm text-muted-foreground">Premium members get priority queue access.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Mail className="size-5 text-primary" />
          <p className="mt-3 font-medium text-foreground">help@expatmail.ai</p>
          <p className="mt-1 text-sm text-muted-foreground">Attach the scan ID and we will look into it.</p>
        </div>
      </div>

      <form
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="Question about my Finanzamt letter" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={5} placeholder="Tell us what is confusing you…" />
        </div>
        <Button type="submit">Send message</Button>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="text-base font-semibold text-foreground">Frequently asked</h2>
        {faqs.map((f) => (
          <div key={f.q} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">{f.q}</p>
            <p className="mt-1.5 text-sm text-muted-foreground">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
