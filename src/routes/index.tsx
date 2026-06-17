import { createFileRoute } from "@tanstack/react-router";
import ImageTool from "@/components/ImageTool";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Image Compressor & Resizer — JPG, PNG, WebP Converter" },
      { name: "description", content: "Free online tool to compress, resize, and convert images between JPG, PNG, and WebP. Drag & drop, batch processing, instant download. 100% private — runs in your browser." },
      { property: "og:title", content: "Image Compressor & Resizer" },
      { property: "og:description", content: "Compress, resize and convert JPG / PNG / WebP in your browser. Free, private, batch-ready." },
    ],
  }),
  component: Index,
});

function Index() {
  return <ImageTool />;
}
