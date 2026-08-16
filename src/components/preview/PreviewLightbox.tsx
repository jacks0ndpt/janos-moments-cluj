import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { previewImageUrl, type PreviewImageRow } from "@/lib/samedayPreview";

type Props = {
  images: PreviewImageRow[];
  index: number;
  coupleNames: string;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export default function PreviewLightbox({
  images,
  index,
  coupleNames,
  onClose,
  onIndexChange,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const image = images[index];

  const next = useCallback(
    () => onIndexChange((index + 1) % images.length),
    [index, images.length, onIndexChange],
  );
  const prev = useCallback(
    () => onIndexChange((index - 1 + images.length) % images.length),
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [next, prev, onClose]);

  async function download() {
    if (!image || downloading) return;
    setDownloading(true);
    const url = previewImageUrl(image.storage_path);
    const name = `${coupleNames.replace(/[^\w]+/g, "-").toLowerCase()}-${index + 1}.jpg`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    } catch {
      window.open(url, "_blank", "noopener");
    } finally {
      setDownloading(false);
    }
  }

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${coupleNames} — photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-50 flex flex-col bg-background/98 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        touchStart.current = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) next();
          else prev();
        }
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-xs tracking-[0.2em] text-muted-foreground">
          {index + 1} / {images.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={download}
            aria-label="Download this photo"
            className="flex items-center gap-2 rounded-full px-3 py-2 text-xs tracking-wide text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <Download size={16} aria-hidden="true" />
            <span className="hidden sm:inline">
              {downloading ? "Preparing…" : "Download this photo"}
            </span>
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-foreground/80 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-6 sm:px-16">
        <img
          key={image.id}
          src={previewImageUrl(image.storage_path)}
          alt={`${coupleNames} — photo ${index + 1}`}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          className="max-h-full max-w-full object-contain animate-[fadeIn_0.25s_ease-out]"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-1 hidden rounded-full p-3 text-foreground/70 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:block"
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-1 hidden rounded-full p-3 text-foreground/70 transition-colors hover:text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:block"
            >
              <ChevronRight size={28} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}