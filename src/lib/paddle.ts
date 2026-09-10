import { toast } from "sonner";

// Paddle.js loads from CDN in __root.tsx and exposes `window.Paddle`.
// Configure your Paddle client-side token and environment in Lovable project settings:
//   VITE_PADDLE_CLIENT_TOKEN=your_client_side_token
//   VITE_PADDLE_ENVIRONMENT=live   (or "sandbox" for testing)

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

interface PaddleInstance {
  Environment: {
    set(env: "sandbox" | "live"): void;
  };
  Initialize: (options: {
    token: string;
    eventCallback?: (event: PaddleEvent) => void;
  }) => void;
  Checkout: {
    open: (options: {
      items: Array<{ priceId: string; quantity: number }>;
      settings?: Record<string, unknown>;
      customData?: Record<string, unknown>;
    }) => void;
  };
}

interface PaddleEvent {
  name: string;
  data?: Record<string, unknown>;
}

const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN as string | undefined;
const PADDLE_ENVIRONMENT =
  (import.meta.env.VITE_PADDLE_ENVIRONMENT as "sandbox" | "live" | undefined) ?? "live";

let paddleReadyPromise: Promise<PaddleInstance> | null = null;

function waitForPaddle(): Promise<PaddleInstance> {
  if (paddleReadyPromise) return paddleReadyPromise;

  paddleReadyPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Paddle checkout can only be used in the browser."));
      return;
    }

    if (window.Paddle) {
      resolve(window.Paddle);
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error("Paddle.js did not load. Please check your network or the Paddle script injection."));
    }, 15000);

    const check = setInterval(() => {
      if (window.Paddle) {
        clearInterval(check);
        clearTimeout(timeout);
        resolve(window.Paddle);
      }
    }, 100);
  });

  return paddleReadyPromise;
}

export async function openPaddleCheckout(priceId: string) {
  if (!PADDLE_CLIENT_TOKEN) {
    toast.error("Paddle client token is missing. Add VITE_PADDLE_CLIENT_TOKEN in Project Settings → Environment.");
    return;
  }

  try {
    const Paddle = await waitForPaddle();

    if (PADDLE_ENVIRONMENT === "sandbox") {
      Paddle.Environment.set("sandbox");
    }

    Paddle.Initialize({
      token: PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === "checkout.completed") {
          toast.success("Payment successful! Welcome to ExpatMail AI.");
        } else if (event.name === "checkout.error") {
          toast.error("Checkout failed. Please try again or contact support.");
        }
      },
    });

    Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
    });

    toast.success("Checkout opened — complete your subscription securely.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    toast.error(`Paddle checkout failed: ${message}`);
  }
}
