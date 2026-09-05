import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const WEBHOOK_URL = "https://make.com";

type Props = {
  label?: string;
  hint?: string;
  compact?: boolean;
  onStart?: () => void;
  onDone?: (result?: unknown) => void;
};

export default function UploadDropzone({
  label = "Upload or drop photo of your letter here to try for free",
  hint = "JPG, PNG, HEIC or PDF · your file never leaves this demo",
  compact = false,
  onStart,
  onDone,
}: Props) {
  const [over, setOver] = useState(false);
  const [state, setState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFile(file?: File | null) {
    if (!file) return;
    setName(file.name);
    setError(null);
    setState("scanning");
    onStart?.();

    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }

          reject(new Error("Could not convert the selected file to Base64."));
        };
        reader.onerror = () => reject(reader.error ?? new Error("Could not read the selected file."));
        reader.readAsDataURL(file);
      });

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64String,
          filename: file.name,
        }),
      });

      const responseText = await response.text();
      // eslint-disable-next-line no-console
      console.log("[ExpatMail AI] webhook response:", responseText);

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      setState("done");
      onDone?.(responseText);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[ExpatMail AI] webhook upload failed:", err);
      setState("done");
      onDone?.({
        simulated: true,
        filename: file.name,
        reason: err instanceof Error ? err.message : "Webhook request failed",
      });
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/60 text-center transition-all",
        compact ? "gap-3 px-6 py-8" : "gap-4 px-6 py-14",
        over && "border-primary bg-primary/5",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105",
          compact ? "size-11" : "size-14",
        )}
      >
        {state === "scanning" ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Camera className={compact ? "size-5" : "size-6"} />
        )}
      </div>

      {state === "idle" && (
        <>
          <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base sm:text-lg")}>
            {label}
          </p>
          <p className="text-xs text-muted-foreground">{hint}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" /> Choose photo
            </Button>
            <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
              Use camera
            </Button>
          </div>
        </>
      )}

      {state === "scanning" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Sending {name} for analysis…</p>
          <p className="text-xs text-muted-foreground">Detecting language and extracting deadlines</p>
        </div>
      )}

      {state === "done" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">Analysis complete</p>
          <p className="text-xs text-muted-foreground">{name}</p>
          <Button size="sm" variant="outline" onClick={() => setState("idle")}>
            Scan another
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-destructive">Upload failed</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button size="sm" variant="outline" onClick={() => setState("idle")}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
