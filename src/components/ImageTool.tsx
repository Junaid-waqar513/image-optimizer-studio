import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

function saveAs(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type OutputFormat = "original" | "image/jpeg" | "image/png" | "image/webp";

type Status = "pending" | "processing" | "done" | "error";

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  width: number;
  height: number;
  status: Status;
  outputBlob?: Blob;
  outputUrl?: string;
  outputSize?: number;
  outputName?: string;
  error?: string;
}

const formatLabel: Record<Exclude<OutputFormat, "original">, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function bytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

function changeExt(name: string, ext: string) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

export default function ImageTool() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [format, setFormat] = useState<OutputFormat>("original");
  const [quality, setQuality] = useState(80);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState<number | "">(1920);
  const [maxHeight, setMaxHeight] = useState<number | "">("");
  const [keepAspect, setKeepAspect] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newItems: ImageItem[] = [];
    for (const file of arr) {
      try {
        const img = await loadImage(file);
        newItems.push({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: img.src,
          originalSize: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          status: "pending",
        });
      } catch {
        // skip unreadable
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      const removed = prev.find((i) => i.id === id);
      if (removed?.outputUrl) URL.revokeObjectURL(removed.outputUrl);
      if (removed?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const clearAll = () => {
    items.forEach((i) => {
      if (i.outputUrl) URL.revokeObjectURL(i.outputUrl);
      if (i.previewUrl.startsWith("blob:")) URL.revokeObjectURL(i.previewUrl);
    });
    setItems([]);
  };

  const processItem = async (item: ImageItem): Promise<ImageItem> => {
    const img = await loadImage(item.file);
    let { naturalWidth: w, naturalHeight: h } = img;

    if (resizeEnabled) {
      const mw = typeof maxWidth === "number" ? maxWidth : 0;
      const mh = typeof maxHeight === "number" ? maxHeight : 0;
      if (keepAspect) {
        const ratio = w / h;
        if (mw && w > mw) {
          w = mw;
          h = Math.round(mw / ratio);
        }
        if (mh && h > mh) {
          h = mh;
          w = Math.round(mh * ratio);
        }
      } else {
        if (mw) w = mw;
        if (mh) h = mh;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);

    const targetType: string =
      format === "original" ? item.file.type || "image/jpeg" : format;
    const q = quality / 100;

    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Encoding failed"))),
        targetType,
        targetType === "image/png" ? undefined : q,
      ),
    );

    const ext =
      targetType === "image/jpeg"
        ? "jpg"
        : targetType === "image/png"
          ? "png"
          : targetType === "image/webp"
            ? "webp"
            : (item.file.name.split(".").pop() || "img");

    const url = URL.createObjectURL(blob);
    return {
      ...item,
      status: "done",
      outputBlob: blob,
      outputUrl: url,
      outputSize: blob.size,
      outputName: changeExt(item.file.name, ext),
    };
  };

  const processAll = async () => {
    if (!items.length) return;
    setBusy(true);
    const queue = items.filter((i) => i.status !== "done");
    for (const item of queue) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i)),
      );
      try {
        const done = await processItem(item);
        setItems((prev) => prev.map((i) => (i.id === item.id ? done : i)));
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: (err as Error).message }
              : i,
          ),
        );
      }
    }
    setBusy(false);
  };

  const downloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.outputBlob);
    if (!done.length) return;
    if (done.length === 1) {
      saveAs(done[0].outputBlob!, done[0].outputName);
      return;
    }
    // Multiple files: trigger sequential downloads (no zip dep needed)
    for (const i of done) {
      saveAs(i.outputBlob!, i.outputName!);
      await new Promise((r) => setTimeout(r, 150));
    }
  };

  const stats = useMemo(() => {
    const done = items.filter((i) => i.status === "done");
    const orig = done.reduce((s, i) => s + i.originalSize, 0);
    const out = done.reduce((s, i) => s + (i.outputSize ?? 0), 0);
    const saved = orig - out;
    const pct = orig ? Math.max(0, Math.round((saved / orig) * 100)) : 0;
    return { count: done.length, orig, out, saved, pct };
  }, [items]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div>
            <h1 className="text-xl font-semibold">PixelSqueeze</h1>
            <p className="text-xs text-muted-foreground">
              Compress · Resize · Convert — all in your browser
            </p>
          </div>
          <a
            href="#tool"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            100% private — no uploads
          </a>
        </div>
      </header>

      <main id="tool" className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Compress & convert images instantly
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Drag in JPG, PNG, or WebP files. Resize, batch-process, and download
            optimized images — everything runs locally on your device.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? "border-primary bg-accent"
                  : "border-border bg-card hover:bg-accent/50"
              }`}
            >
              <div className="mb-3 text-4xl">📁</div>
              <p className="font-medium">Drop images here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG · PNG · WebP · GIF — batch upload supported
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {items.length > 0 && (
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">
                    {items.length} image{items.length === 1 ? "" : "s"}
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={processAll}
                      disabled={busy}
                    >
                      {busy ? "Processing…" : "Process all"}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={downloadAll}
                      disabled={!items.some((i) => i.status === "done")}
                    >
                      Download
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((i) => (
                    <div
                      key={i.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-2"
                    >
                      <img
                        src={i.previewUrl}
                        alt={i.file.name}
                        className="h-14 w-14 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{i.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.width}×{i.height} · {bytes(i.originalSize)}
                          {i.status === "done" && i.outputSize !== undefined && (
                            <>
                              {" → "}
                              <span className="text-foreground">
                                {bytes(i.outputSize)}
                              </span>{" "}
                              <span className="text-emerald-600">
                                (-
                                {Math.max(
                                  0,
                                  Math.round(
                                    ((i.originalSize - i.outputSize) /
                                      i.originalSize) *
                                      100,
                                  ),
                                )}
                                %)
                              </span>
                            </>
                          )}
                          {i.status === "processing" && " · processing…"}
                          {i.status === "error" && (
                            <span className="text-destructive"> · {i.error}</span>
                          )}
                        </p>
                      </div>
                      {i.status === "done" && i.outputBlob && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveAs(i.outputBlob!, i.outputName)}
                        >
                          Save
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(i.id)}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                </div>

                {stats.count > 0 && (
                  <div className="mt-4 rounded-lg bg-accent p-3 text-sm">
                    Saved <strong>{bytes(stats.saved)}</strong> across{" "}
                    {stats.count} image{stats.count === 1 ? "" : "s"} —{" "}
                    <strong>{stats.pct}%</strong> smaller on average.
                  </div>
                )}
              </Card>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="space-y-4 p-4">
              <h3 className="font-medium">Output settings</h3>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as OutputFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Keep original</SelectItem>
                    <SelectItem value="image/jpeg">Convert to JPG</SelectItem>
                    <SelectItem value="image/png">Convert to PNG</SelectItem>
                    <SelectItem value="image/webp">Convert to WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Quality</Label>
                  <span className="text-sm text-muted-foreground">{quality}%</span>
                </div>
                <Slider
                  value={[quality]}
                  min={10}
                  max={100}
                  step={1}
                  onValueChange={(v) => setQuality(v[0])}
                  disabled={format === "image/png"}
                />
                {format === "image/png" && (
                  <p className="text-xs text-muted-foreground">
                    PNG is lossless — quality slider disabled.
                  </p>
                )}
              </div>
            </Card>

            <Card className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Resize</h3>
                <Switch
                  checked={resizeEnabled}
                  onCheckedChange={setResizeEnabled}
                />
              </div>

              {resizeEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Max width (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={maxWidth}
                        onChange={(e) =>
                          setMaxWidth(e.target.value ? Number(e.target.value) : "")
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Max height (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={maxHeight}
                        onChange={(e) =>
                          setMaxHeight(e.target.value ? Number(e.target.value) : "")
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Keep aspect ratio</Label>
                    <Switch checked={keepAspect} onCheckedChange={setKeepAspect} />
                  </div>
                </>
              )}
            </Card>

            <Card className="p-4 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Private by design.</strong> Your
                images are processed entirely in your browser using the Canvas API.
                Nothing is ever uploaded to a server.
              </p>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="mt-8 border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built with the Canvas API · No backend required
      </footer>
    </div>
  );
}