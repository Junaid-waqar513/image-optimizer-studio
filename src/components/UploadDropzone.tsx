import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  label?: string;
  hint?: string;
  compact?: boolean;
  onDone?: () => void;
};

export default function UploadDropzone({
  label = "Upload or drop photo of your letter here to try for free",
  hint = "JPG, PNG, HEIC or PDF · your file never leaves this demo",
  compact = false,
  onDone,
}: Props) {
  const [over, setOver] = useState(false);
  const [state, setState] = useState<"idle" | "scanning" | "done">("idle");
  const [name, setName] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function simulate(fileName?: string) {
    setName(fileName ?? "letter-photo.jpg");
    setState("scanning");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState("done");
      onDone?.();
    }, 1600);
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
        simulate(e.dataTransfer.files?.[0]?.name);
      }}
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/60 text-center transition-all",
        compact ? "gap-3 px-6 py-8" : "gap-4 px-6 py-14",
        over && "border-primary bg-primary/5",
      )}
    >
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
            <Button size="sm" onClick={() => simulate()}>
              <Upload className="size-4" /> Choose photo
            </Button>
            <Button size="sm" variant="outline" onClick={() => simulate("camera-capture.jpg")}>
              Use camera
            </Button>
          </div>
        </>
      )}

      {state === "scanning" && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Reading {name}…</p>
          <p className="text-xs text-muted-foreground">Detecting language and extracting deadlines</p>
        </div>
      )}

      {state === "done" && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">Scan complete — 1 deadline found</p>
          <p className="text-xs text-muted-foreground">
            Demo mode: open a sample analysis to see the full breakdown.
          </p>
          <Button size="sm" variant="outline" onClick={() => setState("idle")}>
            Scan another
          </Button>
        </div>
      )}
    </div>
  );
}
