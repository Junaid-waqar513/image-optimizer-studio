import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getPaddle } from "@/lib/paddle-client";
import { tiers, type BillingCycle } from "@/lib/tiers";
import { getVisitorCountry } from "@/lib/geo.functions";

const isPlaceholder = (id: string) => id.startsWith("pri_REPLACE");

interface PricingTableProps {
  /** Prefilled into checkout when the visitor is signed in. */
  customerEmail?: string;
  /**
   * The signed-in user's id (must equal users.id in Supabase). Sent to Paddle as
   * customData.userId — the webhook uses it to know WHOSE subscription to activate.
   */
  userId?: string;
}

export default function PricingTable({ customerEmail, userId }: PricingTableProps) {
  const [cycle, setCycle] = useState<BillingCycle>("month");
  const [configError, setConfigError] = useState<string | null>(null);

  const countryQuery = useQuery({
    queryKey: ["visitor-country"],
    queryFn: () => getVisitorCountry(),
    staleTime: Infinity,
  });

  const country = countryQuery.data?.country ?? null;

  const priceIds = useMemo(
    () => tiers.map((t) => t.priceId[cycle]).filter((id) => !isPlaceholder(id)),
    [cycle],
  );

  const pricesQuery = useQuery({
    // Wait for country detection so we never preview with the wrong location.
    enabled: countryQuery.isSuccess && priceIds.length > 0,
    queryKey: ["paddle-prices", cycle, country, priceIds.join(",")],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const paddle = await getPaddle();
      const preview = await paddle.PricePreview({
        items: priceIds.map((priceId) => ({ priceId, quantity: 1 })),
        // Omit address entirely when no country was detected: Paddle then
        // auto-detects the visitor's location from their IP.
        ...(country ? { address: { countryCode: country } } : {}),
      });

      const map: Record<string, string> = {};
      for (const item of preview.data.details.lineItems) {
        map[item.price.id] = item.formattedTotals.total;
      }
      return map;
    },
  });

  useEffect(() => {
    // Surface a missing/incorrect env configuration loudly instead of silently
    // rendering an empty pricing table.
    getPaddle().catch((error: unknown) => {
      setConfigError(error instanceof Error ? error.message : "Paddle could not be initialized.");
    });
  }, []);

  async function subscribe(priceId: string) {
    if (isPlaceholder(priceId)) {
      toast.error("This plan has no yearly price ID yet — add it in src/lib/tiers.ts.");
      return;
    }

    if (!userId) {
      // Without customData.userId the webhook can't link the payment to an account.
      console.warn("[paddle] Opening checkout without a userId — this purchase cannot be auto-activated.");
    }

    try {
      const paddle = await getPaddle();
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        ...(customerEmail ? { customer: { email: customerEmail } } : {}),
        ...(userId ? { customData: { userId } } : {}),
        settings: {
          displayMode: "overlay",
          variant: "one-page",
          successUrl: `${window.location.origin}/welcome`,
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout could not be opened.");
    }
  }

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["month", "year"] as BillingCycle[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              aria-pressed={cycle === option}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                cycle === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option === "month" ? "Monthly" : "Yearly"}
            </button>
          ))}
        </div>
      </div>

      {configError && (
        <p className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {configError}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const priceId = tier.priceId[cycle];
          const total = pricesQuery.data?.[priceId];

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-card p-7 ${
                tier.popular ? "border-primary/40 shadow-lg shadow-primary/10" : "border-border"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-7 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Sparkles className="size-3" /> Most popular
                </span>
              )}
              <p
                className={`text-sm font-medium ${
                  tier.popular ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tier.name}
              </p>

              <p className="mt-2 flex min-h-11 items-baseline gap-1.5 text-4xl font-semibold tracking-tight text-foreground">
                {total ? (
                  <>
                    {/* Paddle's already-formatted total — displayed verbatim. */}
                    <span>{total}</span>
                    <span className="text-base font-normal text-muted-foreground">
                      /{cycle === "month" ? "mo" : "yr"}
                    </span>
                  </>
                ) : pricesQuery.isError || isPlaceholder(priceId) ? (
                  <span className="text-base font-normal text-muted-foreground">
                    Price unavailable
                  </span>
                ) : (
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>

              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-7 w-full"
                size="lg"
                variant={tier.popular ? "default" : "outline"}
                disabled={!total}
                onClick={() => subscribe(priceId)}
              >
                Subscribe to {tier.name}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
