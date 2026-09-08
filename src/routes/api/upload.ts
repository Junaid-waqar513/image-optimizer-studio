import { createFileRoute } from "@tanstack/react-router";

const WEBHOOK_URL = "https://make.com";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const imageBase64 = body?.imageBase64;
          if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
            return Response.json({ error: "Missing imageBase64 payload" }, { status: 400 });
          }

          const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64 }),
          });

          const text = await response.text();
          return Response.json(
            { ok: response.ok, status: response.status, response: text },
            { status: response.ok ? 200 : 502 },
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
