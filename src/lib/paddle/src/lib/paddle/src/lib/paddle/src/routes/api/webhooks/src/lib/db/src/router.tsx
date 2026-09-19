ANALYTICS SETUP (Vercel Analytics — zero-config, shows visitors/pageviews in your Vercel dashboard)

1. Install:
   bun add @vercel/analytics

2. In src/router.tsx (or wherever your root layout/App component renders),
   add near the top of your JSX tree:

   import { Analytics } from "@vercel/analytics/react";

   // inside your root component's return, alongside your other JSX:
   <Analytics />

3. Commit, push, redeploy. Then in Vercel Dashboard > your project >
   Analytics tab, you'll see live visitor counts, top pages, and referrers
   within a few minutes of traffic.

---

OPTIONAL — FUNNEL TRACKING (know WHERE people drop off before paying)
For "who visits" Vercel Analytics is enough. To see the money-relevant
funnel (upload -> summary shown -> subscribe clicked -> paid), add
PostHog (free tier, generous limits):

1. bun add posthog-js
2. Init once in src/router.tsx:

   import posthog from "posthog-js";
   if (typeof window !== "undefined") {
     posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
       api_host: "https://us.i.posthog.com",
     });
   }

3. Fire events at the key moments:
   posthog.capture("scan_uploaded");
   posthog.capture("summary_shown");
   posthog.capture("subscribe_clicked", { tier: "starter" });
   // and in your webhook handler after activateSubscription():
   // posthog.capture("subscription_activated", { tier, userId })

This tells you your real conversion rate at each step — the single most
useful number for deciding what to fix next.
