import { createFileRoute } from "@tanstack/react-router";

const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/jm6t42dawoafeoqkfnctkstrww727bf6";

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      // Server-side proxy: the browser posts the file here (same-origin, so no
      // CORS), and this handler forwards it server-to-server to Make.com,
      // then relays the response back to the React dashboard.
      POST: async ({ request }) => {
        try {
          const contentType = request.headers.get("content-type") ?? "";
          const upstream = await fetch(MAKE_WEBHOOK_URL, {
            method: "POST",
            body: await request.arrayBuffer(),
            headers: { "Content-Type": contentType },
          });

          const text = await upstream.text();
          console.log("[upload-proxy] Make.com status:", upstream.status);

          return new Response(text, {
            status: upstream.status,
            headers: {
              "Content-Type":
                upstream.headers.get("content-type") ?? "application/json",
            },
          });
        } catch (error) {
          console.error("[upload-proxy] proxy error:", error);
          return Response.json(
            {
              error:
                error instanceof Error ? error.message : "Proxy request failed",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
