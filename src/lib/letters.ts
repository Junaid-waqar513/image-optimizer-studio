import letterFinanzamt from "@/assets/letter-finanzamt.jpg";
import letterCaf from "@/assets/letter-caf.jpg";

export type LetterStatus = "urgent" | "resolved" | "in-review";

export type Letter = {
  id: string;
  sender: string;
  kind: string;
  country: string;
  flag: string;
  language: string;
  status: LetterStatus;
  dateLabel: string;
  image: string;
  summary: string;
  deadline: string;
  steps: { id: string; label: string; done: boolean }[];
  calendarTitle: string;
};

export const letters: Letter[] = [
  {
    id: "finanzamt-berlin",
    sender: "Finanzamt Berlin",
    kind: "Tax Letter",
    country: "Germany",
    flag: "🇩🇪",
    language: "German",
    status: "urgent",
    dateLabel: "Today",
    image: letterFinanzamt,
    summary:
      "The Berlin tax office reviewed your 2023 income tax return and calculated a remaining balance of €45.20. You must pay it by 12 October and return a signed copy of page 3, or late-payment interest is added automatically.",
    deadline: "October 12",
    steps: [
      { id: "s1", label: "Pay €45.20 to IBAN DE89 1002 0500 0001 2345 67 by Oct 12th", done: false },
      { id: "s2", label: "Use reference number 27/123/45678 in the transfer note", done: false },
      { id: "s3", label: "Sign and return page 3 to Finanzamt Berlin, Klosterstraße 59", done: false },
      { id: "s4", label: "Keep the Bescheid — you have 1 month to file an objection", done: false },
    ],
    calendarTitle: "Pay Finanzamt Berlin €45.20 (deadline)",
  },
  {
    id: "caf-paris",
    sender: "CAF Paris",
    kind: "Housing Allowance",
    country: "France",
    flag: "🇫🇷",
    language: "French",
    status: "resolved",
    dateLabel: "3 days ago",
    image: letterCaf,
    summary:
      "CAF approved your housing allowance (APL) request. You will receive €164.00 per month starting 1 May, with the first payment landing on 5 May — no action or payment is required from you.",
    deadline: "No deadline",
    steps: [
      { id: "s1", label: "Confirm your landlord's IBAN is on file with CAF", done: true },
      { id: "s2", label: "Check the first €164.00 payment arrived on May 5th", done: true },
      { id: "s3", label: "Report any change of address or income within 30 days", done: false },
    ],
    calendarTitle: "CAF Paris — quarterly allowance review",
  },
];

export function getLetter(id: string) {
  return letters.find((l) => l.id === id);
}

export const statusMeta: Record<LetterStatus, { label: string; className: string }> = {
  urgent: {
    label: "Urgent action needed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  "in-review": {
    label: "In review",
    className: "bg-muted text-muted-foreground border-border",
  },
};
